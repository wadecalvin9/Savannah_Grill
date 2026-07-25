import { Account, Avatars, Client, Databases, ID, Query, Storage } from "react-native-appwrite"
import * as FileSystem from 'expo-file-system/legacy'

export const appwriteConfig = {
    endpoint: process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT,
    platform: "com.tukibl.savannahgrill",
    projectid: process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID,
    projectId: process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID,
    databaseid: "6a5fefc7000e1b8db540",
    databaseId: "6a5fefc7000e1b8db540",
    usertableid: "user",
    userCollectionId: "user",
    categorytableid: "categories",
    categoriesCollectionId: "categories",
    menutableid: "menu",
    menuCollectionId: "menu",
    customizationtableid: "customizations",
    customizationsCollectionId: "customizations",
    menuCustomizationtableid: "menu_customizations",
    menuCustomizationsCollectionId: "menu_customizations",
    ordersCollectionId: "orders",
    bucketid: "6a60eabb000a0570f4d3",
    bucketId: "6a60eabb000a0570f4d3"
}

export const client = new Client()

client
    .setEndpoint(appwriteConfig.endpoint)
    .setProject(appwriteConfig.projectid)
    .setPlatform(appwriteConfig.platform)

export const account = new Account(client)
export const databases = new Databases(client)
export const storage = new Storage(client)
const avatars = new Avatars(client)

export const createUser = async ({ name, email, password }) => {
    try {
        const newAccount = await account.create(ID.unique(), email, password, name)
        if (!newAccount) throw new Error("Account creation failed")

        const avatarUrl = `https://cloud.appwrite.io/v1/avatars/initials?name=${encodeURIComponent(name)}`

        await signin({ email, password })

        const newUser = await databases.createDocument(
            appwriteConfig.databaseid,
            appwriteConfig.usertableid,
            ID.unique(),
            {
                accountid: newAccount.$id,
                name,
                email,
                profile: avatarUrl
            }
        )
        return newUser;
    } catch (error) {
        console.error("Appwrite createUser error:", error)
        throw new Error(error.message || error)
    }
}

export const signin = async ({ email, password }) => {
    try {
        try {
            await account.deleteSession("current");
        } catch (_) {}

        const session = await account.createEmailPasswordSession(email, password)
        return session;
    } catch (error) {
        console.error("Appwrite signin error:", error)
        throw new Error(error.message || error)
    }
}

export const signIn = signin;

export const getCurrentUser = async () => {
    try {
        const currentAccount = await account.get();
        if (!currentAccount) return null;

        const currentUser = await databases.listDocuments(
            appwriteConfig.databaseid,
            appwriteConfig.usertableid,
            [Query.equal("accountid", currentAccount.$id)]
        );

        if (!currentUser || currentUser.documents.length === 0) return null;

        return currentUser.documents[0];
    } catch (error) {
        // Normal behavior when no session is active (guest role)
        return null;
    }
}

export const getMenu = async ({ category, query } = {}) => {
    try {
        const queries = [];

        if (category) queries.push(Query.equal('categories', category));
        if (query) queries.push(Query.search('name', query));

        const menus = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.menuCollectionId,
            queries
        )

        return menus.documents;
    } catch (error) {
        console.error("Appwrite getMenu error:", error);
        throw new Error(error.message || error);
    }
}

export const getCategories = async () => {
    try {
        const categories = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.categoriesCollectionId
        )

        return categories.documents;
    } catch (error) {
        console.error("Appwrite getCategories error:", error);
        throw new Error(error.message || error);
    }
}

export const getMenuItem = async (id) => {
    try {
        // Fetch the base menu document
        const item = await databases.getDocument(
            appwriteConfig.databaseId,
            appwriteConfig.menuCollectionId,
            id
        )

        // Fetch recommendations: other items from the same category
        const queries = [Query.notEqual('$id', id), Query.limit(6)]
        if (item.categories?.$id) {
            queries.unshift(Query.equal('categories', item.categories.$id))
        }
        const recommended = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.menuCollectionId,
            queries
        )
        item.recommendations = recommended.documents

        return item;
    } catch (error) {
        console.error("Appwrite getMenuItem error:", error);
        throw new Error(error.message || error);
    }
}

export const createMenuItem = async ({ name, description, price, categoryId, image_url, calories, protein }) => {
    try {
        const payload = {
            name,
            description,
            price: Number(price),
            categories: categoryId,
            image_url,
        }
        if (calories !== undefined && calories !== null && calories !== '') {
            payload.calories = Number(calories)
        }
        if (protein !== undefined && protein !== null && protein !== '') {
            payload.protein = Number(protein)
        }

        const newDoc = await databases.createDocument(
            appwriteConfig.databaseId,
            appwriteConfig.menuCollectionId,
            ID.unique(),
            payload
        )
        return newDoc
    } catch (error) {
        console.error("Appwrite createMenuItem error:", error)
        throw new Error(error.message || error)
    }
}

export const updateMenuItem = async (id, data) => {
    try {
        const payload = { ...data }
        if (payload.price !== undefined) payload.price = Number(payload.price)
        if (payload.calories !== undefined && payload.calories !== '') payload.calories = Number(payload.calories)
        if (payload.protein !== undefined && payload.protein !== '') payload.protein = Number(payload.protein)

        const updatedDoc = await databases.updateDocument(
            appwriteConfig.databaseId,
            appwriteConfig.menuCollectionId,
            id,
            payload
        )
        return updatedDoc
    } catch (error) {
        console.error("Appwrite updateMenuItem error:", error)
        throw new Error(error.message || error)
    }
}

export const deleteMenuItem = async (id) => {
    try {
        await databases.deleteDocument(
            appwriteConfig.databaseId,
            appwriteConfig.menuCollectionId,
            id
        )
        return true
    } catch (error) {
        console.error("Appwrite deleteMenuItem error:", error)
        throw new Error(error.message || error)
    }
}

// ── ORDERS ──────────────────────────────────────────────

// items_json is a text[] in Appwrite — each element is a JSON-stringified item object
export const createOrder = async ({ customerName, customerId, address, note, items, totalPrice }) => {
    try {
        const itemsJson = items.map(it => JSON.stringify(it))
        const doc = await databases.createDocument(
            appwriteConfig.databaseId,
            appwriteConfig.ordersCollectionId,
            ID.unique(),
            {
                customer_name: customerName,
                customer_id: customerId || '',
                address: address || '',
                note: note || '',
                items_json: itemsJson,
                total_price: Math.round(totalPrice),
                status: 'Pending',
            }
        )
        return doc
    } catch (error) {
        console.error('Appwrite createOrder error:', error)
        throw new Error(error.message || error)
    }
}

export const getOrders = async () => {
    try {
        const res = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.ordersCollectionId,
            [Query.orderDesc('$createdAt')]
        )
        // Parse items_json[] back into objects
        return res.documents.map(doc => ({
            ...doc,
            id: doc.$id,
            createdAt: doc.$createdAt,
            customerName: doc.customer_name,
            address: doc.address,
            note: doc.note,
            totalPrice: doc.total_price,
            status: doc.status,
            items: (doc.items_json || []).map(s => {
                try { return JSON.parse(s) } catch { return {} }
            }),
        }))
    } catch (error) {
        console.error('Appwrite getOrders error:', error)
        throw new Error(error.message || error)
    }
}

export const updateOrderStatusDB = async (docId, newStatus) => {
    try {
        await databases.updateDocument(
            appwriteConfig.databaseId,
            appwriteConfig.ordersCollectionId,
            docId,
            { status: newStatus }
        )
        return true
    } catch (error) {
        console.error('Appwrite updateOrderStatusDB error:', error)
        throw new Error(error.message || error)
    }
}

export const getMyOrders = async (customerId) => {
    try {
        // Fetch all orders and filter client-side to avoid needing a customer_id index
        const res = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.ordersCollectionId,
            [Query.orderDesc('$createdAt'), Query.limit(100)]
        )
        return res.documents
            .filter(doc => doc.customer_id === customerId)
            .map(doc => ({
                ...doc,
                id: doc.$id,
                createdAt: doc.$createdAt,
                customerName: doc.customer_name,
                address: doc.address,
                note: doc.note,
                totalPrice: doc.total_price,
                status: doc.status,
                riderId: doc.rider_id || '',
                riderName: doc.rider_name || '',
                items: (doc.items_json || []).map(s => {
                    try { return JSON.parse(s) } catch { return {} }
                }),
            }))
    } catch (error) {
        console.error('Appwrite getMyOrders error:', error)
        throw new Error(error.message || error)
    }
}

export const getReadyOrders = async () => {
    try {
        // Fetch all recent orders and filter client-side
        // Shows: 'Ready' orders + 'Out for Delivery' orders with no rider assigned yet
        const res = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.ordersCollectionId,
            [Query.orderDesc('$createdAt'), Query.limit(100)]
        )
        return res.documents
            .filter(doc => {
                if (doc.status === 'Ready') return true
                if (doc.status === 'Out for Delivery' && !doc.rider_id) return true
                return false
            })
            .map(doc => ({
                ...doc,
                id: doc.$id,
                createdAt: doc.$createdAt,
                customerName: doc.customer_name,
                address: doc.address,
                note: doc.note,
                totalPrice: doc.total_price,
                status: doc.status,
                items: (doc.items_json || []).map(s => {
                    try { return JSON.parse(s) } catch { return {} }
                }),
            }))
    } catch (error) {
        console.error('Appwrite getReadyOrders error:', error)
        throw new Error(error.message || error)
    }
}

export const getRiderDeliveries = async (riderId) => {
    try {
        // Fetch all recent orders and filter client-side to avoid needing a rider_id index
        const res = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.ordersCollectionId,
            [Query.orderDesc('$createdAt'), Query.limit(100)]
        )
        return res.documents
            .filter(doc => doc.rider_id === riderId)
            .map(doc => ({
                ...doc,
                id: doc.$id,
                createdAt: doc.$createdAt,
                customerName: doc.customer_name,
                address: doc.address,
                note: doc.note,
                totalPrice: doc.total_price,
                status: doc.status,
                items: (doc.items_json || []).map(s => {
                    try { return JSON.parse(s) } catch { return {} }
                }),
            }))
    } catch (error) {
        console.error('Appwrite getRiderDeliveries error:', error)
        throw new Error(error.message || error)
    }
}

export const acceptDelivery = async (orderId, riderId, riderName) => {
    try {
        const payload = { status: 'Out for Delivery' }
        // Only include rider fields if they are supported by the schema
        try { payload.rider_id = riderId } catch (_) {}
        try { payload.rider_name = riderName } catch (_) {}

        await databases.updateDocument(
            appwriteConfig.databaseId,
            appwriteConfig.ordersCollectionId,
            orderId,
            payload
        )
        return true
    } catch (error) {
        // If rider_id attribute doesn't exist yet, just update the status
        if (error?.message?.includes('Attribute not found') || error?.message?.includes('Unknown attribute')) {
            console.warn('acceptDelivery: rider_id/rider_name attribute missing. Updating status only.')
            await databases.updateDocument(
                appwriteConfig.databaseId,
                appwriteConfig.ordersCollectionId,
                orderId,
                { status: 'Out for Delivery' }
            )
            return true
        }
        console.error('Appwrite acceptDelivery error:', error)
        throw new Error(error.message || error)
    }
}

export const getUsers = async () => {
    try {
        const res = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.userCollectionId,
            [Query.orderDesc('$createdAt'), Query.limit(100)]
        )
        return res.documents
    } catch (error) {
        console.error('Appwrite getUsers error:', error)
        throw new Error(error.message || error)
    }
}

export const updateUserRole = async (userId, role) => {
    try {
        await databases.updateDocument(
            appwriteConfig.databaseId,
            appwriteConfig.userCollectionId,
            userId,
            { role }
        )
        return true
    } catch (error) {
        console.error('Appwrite updateUserRole error:', error)
        throw new Error(error.message || error)
    }
}

// ── RATINGS ─────────────────────────────────────────────

// Option B: update the rating field on the menu document directly
// Computes a simple running average: new_rating = (old_rating * n + score) / (n + 1)
// Since we don't store n separately, we store it as the float value and bump it.
export const submitRating = async (menuId, score) => {
    try {
        const item = await databases.getDocument(
            appwriteConfig.databaseId,
            appwriteConfig.menuCollectionId,
            menuId
        )
        const oldRating = item.rating ?? 0
        const ratingCount = item.rating_count ?? 1
        const newRating = Math.round(((oldRating * ratingCount + score) / (ratingCount + 1)) * 10) / 10
        const newCount = ratingCount + 1

        const updatePayload = { rating: newRating }
        // Only update rating_count if that field exists in schema
        if ('rating_count' in item) {
            updatePayload.rating_count = newCount
        }

        const updated = await databases.updateDocument(
            appwriteConfig.databaseId,
            appwriteConfig.menuCollectionId,
            menuId,
            updatePayload
        )
        return updated
    } catch (error) {
        console.error('Appwrite submitRating error:', error)
        throw new Error(error.message || error)
    }
}

// ── IMAGE UPLOAD ─────────────────────────────────────────

export const uploadImageFile = async (fileUri, fileName, mimeType = 'image/jpeg') => {
    try {
        const fileId = ID.unique()
        const name = fileName || `product_${Date.now()}.jpg`

        const endpoint = appwriteConfig.endpoint
        const bucketId = appwriteConfig.bucketId
        const projectId = appwriteConfig.projectId

        // FileSystem.uploadAsync handles Android content:// URIs natively — no FormData issues
        const uploadResult = await FileSystem.uploadAsync(
            `${endpoint}/storage/buckets/${bucketId}/files`,
            fileUri,
            {
                httpMethod: 'POST',
                uploadType: FileSystem.FileSystemUploadType.MULTIPART,
                fieldName: 'file',
                mimeType: mimeType || 'image/jpeg',
                headers: {
                    'X-Appwrite-Project': projectId,
                    'Accept': 'application/json',
                },
                parameters: {
                    fileId,
                    // Send fileName so Appwrite logs a meaningful name
                    name,
                },
            }
        )

        if (uploadResult.status < 200 || uploadResult.status >= 300) {
            const body = JSON.parse(uploadResult.body || '{}')
            throw new Error(body.message || `Upload failed with status ${uploadResult.status}`)
        }

        const result = JSON.parse(uploadResult.body)
        const fileUrl = `${endpoint}/storage/buckets/${bucketId}/files/${result.$id}/view?project=${projectId}`
        return fileUrl
    } catch (error) {
        console.error('Appwrite uploadImageFile error:', error)
        throw new Error(error.message || error)
    }
}

export const signOut = async () => {
    try {
        const session = await account.deleteSession("current");
        return session;
    } catch (error) {
        console.error("Appwrite signOut error:", error);
        throw new Error(error.message || error);
    }
}