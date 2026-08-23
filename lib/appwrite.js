import * as FileSystem from 'expo-file-system/legacy'
import { Account, Avatars, Client, Databases, ID, Query, Storage } from "react-native-appwrite"

export const appwriteConfig = {
    endpoint: process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT || "https://fra.cloud.appwrite.io/v1",
    platform: "com.tukibl.savannahgrill",
    projectid: process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID || "6a5fb194003b1fdc4174",
    projectId: process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID || "6a5fb194003b1fdc4174",
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
                profile: avatarUrl,
                role: 'customer',
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
        } catch (_) { }

        const session = await account.createEmailPasswordSession(email, password)
        return session;
    } catch (error) {
        console.error("Appwrite signin error:", error)
        throw new Error(error.message || error)
    }
}

export const signIn = signin;

const withTimeout = (promise, ms = 15000) => {
    return Promise.race([
        promise,
        new Promise((_, reject) => setTimeout(() => reject(new Error('Appwrite network timeout')), ms))
    ]);
};

export const getCurrentUser = async () => {
    try {
        const currentAccount = await withTimeout(account.get(), 12000);
        if (!currentAccount) return null;

        const currentUser = await withTimeout(databases.listDocuments(
            appwriteConfig.databaseid,
            appwriteConfig.usertableid,
            [Query.equal("accountid", currentAccount.$id)]
        ), 12000);

        if (!currentUser || currentUser.documents.length === 0) {
            // Auth account exists but no matching document in the user collection
            return { missingProfile: true, account: currentAccount };
        }

        return currentUser.documents[0];
    } catch (error) {
        // No active session or network timeout
        return null;
    }
}

export const getMenu = async ({ category, query } = {}) => {
    try {
        const queries = [];

        if (category) queries.push(Query.equal('categories', category));
        if (query) queries.push(Query.search('name', query));

        const menus = await withTimeout(databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.menuCollectionId,
            queries
        ), 20000)

        return menus.documents || [];
    } catch (error) {
        console.warn("Appwrite getMenu warning:", error?.message);
        return [];
    }
}

export const getCategories = async () => {
    try {
        const categories = await withTimeout(databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.categoriesCollectionId
        ), 15000)

        return categories.documents || [];
    } catch (error) {
        console.warn("Appwrite getCategories warning:", error?.message);
        return [];
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

//Orders 

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

export const updateOrderStatus = updateOrderStatusDB;

// Active kitchen queue – Pending, Preparing, Ready
export const getStaffOrders = async () => {
  try {
    const res = await withTimeout(databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.ordersCollectionId,
      [Query.orderDesc('$createdAt'), Query.limit(100)]
    ), 15000)

    const activeStatuses = ['Pending', 'Preparing', 'Ready']

    return res.documents
      .filter(doc => activeStatuses.includes(doc.status))
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
    console.warn('Appwrite getStaffOrders warning:', error?.message)
    return []
  }
}

// Completed / cancelled orders for History tab
export const getStaffOrderHistory = async () => {
  try {
    const res = await withTimeout(databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.ordersCollectionId,
      [Query.orderDesc('$createdAt'), Query.limit(100)]
    ), 15000)

    const activeStatuses = ['Pending', 'Preparing', 'Ready']

    return res.documents
      .filter(doc => !activeStatuses.includes(doc.status))
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
    console.warn('Appwrite getStaffOrderHistory warning:', error?.message)
    return []
  }
}


export const getMyOrders = async (customerId) => {
    try {

        const res = await withTimeout(databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.ordersCollectionId,
            [Query.orderDesc('$createdAt'), Query.limit(100)]
        ), 15000)
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
                riderLat: doc.rider_lat ? parseFloat(doc.rider_lat) : null,
                riderLng: doc.rider_lng ? parseFloat(doc.rider_lng) : null,
                confirmation_code: doc.confirmation_code || '',
                code_generated_at: doc.code_generated_at || '',
                items: (doc.items_json || []).map(s => {
                    try { return JSON.parse(s) } catch { return {} }
                }),
            }))
    } catch (error) {
        console.warn('Appwrite getMyOrders warning:', error?.message)
        return []
    }
}

export const getReadyOrders = async () => {
    try {

        const res = await withTimeout(databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.ordersCollectionId,
            [Query.orderDesc('$createdAt'), Query.limit(100)]
        ), 15000)
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
                riderLat: doc.rider_lat ? parseFloat(doc.rider_lat) : null,
                riderLng: doc.rider_lng ? parseFloat(doc.rider_lng) : null,
                items: (doc.items_json || []).map(s => {
                    try { return JSON.parse(s) } catch { return {} }
                }),
            }))
    } catch (error) {
        console.warn('Appwrite getReadyOrders warning:', error?.message)
        return []
    }
}

// Generate a 4-digit code
export const generateDeliveryCode = () => {
  return String(Math.floor(1000 + Math.random() * 9000))
}

// Save code + timestamp on the order (called when rider is ready to hand over)
export const setOrderConfirmationCode = async (orderId, code) => {
  try {
    await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.ordersCollectionId,
      orderId,
      {
        confirmation_code: code,
        code_generated_at: new Date().toISOString(),
      }
    )
    return true
  } catch (error) {
    console.error('setOrderConfirmationCode error:', error)
    throw new Error(error.message || error)
  }
}

// Verify code and complete the order
export const verifyDeliveryCodeAndComplete = async (orderId, enteredCode) => {
  try {
    const doc = await databases.getDocument(
      appwriteConfig.databaseId,
      appwriteConfig.ordersCollectionId,
      orderId
    )

    const storedCode = doc.confirmation_code
    const generatedAt = doc.code_generated_at ? new Date(doc.code_generated_at) : null

    if (!storedCode || !generatedAt) {
      throw new Error('No confirmation code found for this order')
    }

    // 1 hour expiry
    const ONE_HOUR_MS = 60 * 60 * 1000
    if (Date.now() - generatedAt.getTime() > ONE_HOUR_MS) {
      throw new Error('Confirmation code has expired. Ask the customer to refresh or contact support.')
    }

    if (String(enteredCode).trim() !== String(storedCode).trim()) {
      throw new Error('Incorrect code')
    }

    // Correct code → mark Completed
    await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.ordersCollectionId,
      orderId,
      {
        status: 'Completed',
        confirmation_code: '',           // clear after use
        code_generated_at: '',
      }
    )

    return true
  } catch (error) {
    console.error('verifyDeliveryCodeAndComplete error:', error)
    throw error
  }
}

export const getRiderDeliveries = async (riderId) => {
    try {
        // Fetch all recent orders and filter client-side to avoid needing a rider_id index
        const res = await withTimeout(databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.ordersCollectionId,
            [Query.orderDesc('$createdAt'), Query.limit(100)]
        ), 15000)

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
                riderLat: doc.rider_lat ? parseFloat(doc.rider_lat) : null,
                riderLng: doc.rider_lng ? parseFloat(doc.rider_lng) : null,
                confirmation_code: doc.confirmation_code || '',
                code_generated_at: doc.code_generated_at || '',
                items: (doc.items_json || []).map(s => {
                    try { return JSON.parse(s) } catch { return {} }
                }),
            }))
    } catch (error) {
        console.error('Appwrite getRiderDeliveries error:', error)
        throw new Error(error.message || error)
    }
}

export const updateOrderRiderLocation = async (orderId, lat, lng) => {
    try {
        await databases.updateDocument(
            appwriteConfig.databaseId,
            appwriteConfig.ordersCollectionId,
            orderId,
            {
                rider_lat: String(lat),
                rider_lng: String(lng),
            }
        )
    } catch (error) {

    }
}

export const acceptDelivery = async (orderId, riderId, riderName) => {
    try {
        const payload = { status: 'Out for Delivery' }

        try { payload.rider_id = riderId } catch (_) { }
        try { payload.rider_name = riderName } catch (_) { }

        await databases.updateDocument(
            appwriteConfig.databaseId,
            appwriteConfig.ordersCollectionId,
            orderId,
            payload
        )
        return true
    } catch (error) {

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


export const uploadImageFile = async (fileUri, fileName, mimeType = 'image/jpeg') => {
    try {
        const fileId = ID.unique()
        const name = fileName || `product_${Date.now()}.jpg`

        const endpoint = appwriteConfig.endpoint
        const bucketId = appwriteConfig.bucketId
        const projectId = appwriteConfig.projectId


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