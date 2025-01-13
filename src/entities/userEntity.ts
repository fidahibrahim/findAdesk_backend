export default interface Iuser{
    _id: string;
    name: string;
    email: string;
    password: string; 
    image?: string;
    isVerified?: boolean;
    isAdmin?: boolean   
    isBlocked?: boolean
}

