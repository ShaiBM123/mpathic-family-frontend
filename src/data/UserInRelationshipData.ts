// import { UserId } from "@chatscope/use-chat";
import {Gender} from "./data";

// export enum Gender {
//     Male = 1,
//     Female = 2
// }

export type UserInRelationshipParams = {
    relationship? : string;
    gender? : Gender; 
    nickName? : string;
    age? : number;
};

export class UserInRelationshipData {
    relationship?: string;
    gender? : Gender; 
    nickName?: string;
    age? : number;

    constructor({
        relationship,
        gender,
        nickName,
        age
    }: UserInRelationshipParams) {
        this.relationship = relationship;
        this.gender = gender;
        this.nickName = nickName;
        this.age = age;
    }
  }