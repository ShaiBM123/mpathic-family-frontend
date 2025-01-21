import { RelationshipCategory, Gender } from '../data/data';

const _relationships: {
    family: {[key: string]: string[]}, 
    family_d2: {[key: string]: string[]},
    acquaintances: {[key: string]: string[]}, 
    friends: {[key: string]: string[]}, 
    work: {[key: string]: string[]}, 
    school: {[key: string]: string[]},
    other: {[key: string]: string[]}
} = {
    family: {
        [Gender.Female] : ["בת", "אמא", "נכדה", "סבתא", "אחות", "אישה"], 
        [Gender.Male] : ["בן", "אבא", "נכד", "סבא", "אח", "בעל"]
    }, 
    family_d2: {
        [Gender.Female] : ["בת דודה", "בת דוד", "דודה", "אחיינית"], 
        [Gender.Male] : ["בן דודה", "בן דוד", "דוד", "אחיין"]
    }, 
    acquaintances: {
        [Gender.Female] : ["ידידה", "שכנה"], 
        [Gender.Male] : ["ידיד", "שכן"]
    }, 
    friends: {
        [Gender.Female] : ["חברה", "בת זוג"], 
        [Gender.Male] : ["חבר", "בן זוג"]
    },
    work: {
        [Gender.Female] : ["בוסית", "עמיתה לעבודה"], 
        [Gender.Male] : ["בוס", "עמית לעבודה"]
    },
    school: {
        [Gender.Female] : ["מורה", "מדריכה", "מנהלת", "מרצה", "רכזת"], 
        [Gender.Male] : ["מורה", "מדריך", "מנהל","מרצה", "רכז"]   
    },
    other: {
        [Gender.Female] : ["לא ידוע", "גרושה"], 
        [Gender.Male] : ["לא ידוע", "גרוש"]   
    }
};

export type RelationshipProps = {
    category?: RelationshipCategory;
    gender?: Gender;
};

export function relationships({ category, gender }: RelationshipProps) {
    switch (category) {

        case RelationshipCategory.Family:
            switch (gender) {
                case Gender.Female:
                case Gender.Male:
                    return _relationships.family[gender]
                default:
                    return [
                        _relationships.family[Gender.Female], 
                        _relationships.family[Gender.Male]
                    ].flat()
            }
        case RelationshipCategory.FamilyD2:
            switch (gender) {
                case Gender.Female:
                case Gender.Male:
                    return _relationships.family_d2[gender]
                default:
                    return [
                        _relationships.family_d2[Gender.Female], 
                        _relationships.family_d2[Gender.Male]
                    ].flat()
            }
        case RelationshipCategory.Friends:
            switch (gender) {
                case Gender.Female:
                case Gender.Male:
                    return _relationships.friends[gender]
                default:
                    return [
                        _relationships.friends[Gender.Female], 
                        _relationships.friends[Gender.Male]
                    ].flat()
            }
        case RelationshipCategory.Acquaintances:
            switch (gender) {
                case Gender.Female:
                case Gender.Male:
                    return _relationships.acquaintances[gender]
                default:
                    return [
                        _relationships.acquaintances[Gender.Female], 
                        _relationships.acquaintances[Gender.Male]
                    ].flat()
            }
        case RelationshipCategory.Work:
            switch (gender) {
                case Gender.Female:
                case Gender.Male:
                    return _relationships.work[gender]
                default:
                    return [
                        _relationships.work[Gender.Female], 
                        _relationships.work[Gender.Male]
                    ].flat()
            }
        case RelationshipCategory.School:
            switch (gender) {
                case Gender.Female:
                case Gender.Male:
                    return _relationships.school[gender]
                default:
                    return [
                        _relationships.school[Gender.Female], 
                        _relationships.school[Gender.Male]
                    ].flat()
            }
        case RelationshipCategory.Other:
            switch (gender) {
                case Gender.Female:
                case Gender.Male:
                    return _relationships.other[gender]
                default:
                    return [
                        _relationships.other[Gender.Female], 
                        _relationships.other[Gender.Male]
                    ].flat()
            }
        default:
            switch (gender) {
                case Gender.Female:
                case Gender.Male:
                    return [
                        _relationships.family[gender], 
                        _relationships.family_d2[gender], 
                        _relationships.friends[gender], 
                        _relationships.acquaintances[gender],
                        _relationships.work[gender], 
                        _relationships.school[gender], 
                        _relationships.other[gender]
                    ].flat()
                default:
                    return [
                        _relationships.family[Gender.Female], 
                        _relationships.family[Gender.Male],
                        _relationships.family_d2[Gender.Female], 
                        _relationships.family_d2[Gender.Male],
                        _relationships.friends[Gender.Female], 
                        _relationships.friends[Gender.Male],
                        _relationships.acquaintances[Gender.Female],
                        _relationships.acquaintances[Gender.Male],
                        _relationships.work[Gender.Female], 
                        _relationships.work[Gender.Male],
                        _relationships.school[Gender.Female], 
                        _relationships.school[Gender.Male],
                        _relationships.other[Gender.Female], 
                        _relationships.other[Gender.Male]
                    ].flat()
            }
    }
}