export default interface Iuser{
    _id: string;
    name: string;
    email: string;
    password: string; 
    mobile?: string;
    image?: string;
    isVerified?: boolean;
    isAdmin?: boolean   
    isBlocked?: boolean
}

