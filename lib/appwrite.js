import { Account, Avatars, Client, Databases, ID, Query } from "react-native-appwrite"

export const appwriteConfig = {
    endpoint: process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT,
    platform: "com.tukibl.savannahgrill",
    projectid: process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID,
    databaseid: "6a5fefc7000e1b8db540",
    usertableid: "user"
}

export const client = new Client()

client
    .setEndpoint(appwriteConfig.endpoint)
    .setProject(appwriteConfig.projectid)
    .setPlatform(appwriteConfig.platform)


export const account = new Account(client)
export const databases = new Databases(client)
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
        } catch (_) {

        }

        const session = await account.createEmailPasswordSession(email, password)
        return session;
    } catch (error) {
        console.error("Appwrite signin error:", error)
        throw new Error(error.message || error)
    }
}

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
        console.error("Appwrite getCurrentUser error:", error)
        return null;
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