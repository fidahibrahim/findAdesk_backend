export default interface IOwner {
    _id: string;
    name: string;
    email: string;
    password: string;
    isVerified?: boolean;
    isAdmin?: boolean
}