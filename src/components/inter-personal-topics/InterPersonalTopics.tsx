import { useState, useCallback, useEffect } from "react";
// import {
//     // Container, Row, Col, Form, Button, CardDeck,
//     Card, CardColumns
// } from "react-bootstrap";
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
// import { faArrowRight, faCircle, faCheck } from '@fortawesome/free-solid-svg-icons'
import * as FASolidIcons from "@fortawesome/free-solid-svg-icons";
// import * as FABrandIcons from "@fortawesome/free-brands-svg-icons";
// import * as FARegularIcons from "@fortawesome/free-regular-svg-icons";
import { getSVGURI } from "../../AppUtils";
// import { useExtendedChat } from "../../ExtendedChatProvider";
import svgClock from "../../images/chat/clock.svg";
import svgQuestionMark from "../../images/chat/question-mark.svg";
import svgSmartPhone from "../../images/chat/smart-phone.svg";
import svgTwoPeoples from "../../images/chat/two-peoples.svg";
import svgOnePeople from "../../images/chat/one-people.svg";

export enum IP1stCategory {
    None,
    HomeAssignmentsAndSchedules,
    School,
    LeisureTime,
    Relationships,
    HomeEconomy,
    SpaceAndPrivacy,
    Health,
    Other
}

export enum IP2ndCategory {
    None,
    Issue1,
    Issue2,
    Issue3,
    Issue4,
    Other
}

export const interPersonalTopicsDictionary = {
    major_categories: {

        [IP1stCategory.HomeAssignmentsAndSchedules]: {
            title: 'לוחות זמנים ומטלות בית',
            iconSrc: svgClock,
            sub_categories: {
                [IP2ndCategory.Other]: { title: 'אחר', description: '' },
                [IP2ndCategory.Issue1]: { title: 'שינויים בלוחות זמנים שנקבעו' },
                [IP2ndCategory.Issue2]: { title: 'לוחות זמנים שקשורים ללימודים' },
                [IP2ndCategory.Issue3]: { title: 'ביצוע מטלה/ות' },
                [IP2ndCategory.Issue4]: { title: 'סדר ונקיון בבית' }
            }
        },

        [IP1stCategory.LeisureTime]: {
            title: 'זמן פנאי ומסכים',
            iconSrc: svgSmartPhone,
            sub_categories: {
                [IP2ndCategory.Other]: { title: 'אחר', description: '' },
                [IP2ndCategory.Issue1]: { title: 'זמני מסך' },
                [IP2ndCategory.Issue2]: { title: 'יציאה / נסיעה / חופשה' },
                [IP2ndCategory.Issue3]: { title: 'זמן איכות יחד' },
                [IP2ndCategory.Issue4]: { title: 'תחביבים וחוגים' }
            }
        },

        [IP1stCategory.Relationships]: {
            title: 'תקשורת ומערכות יחסים',
            iconSrc: svgTwoPeoples,
            sub_categories: {
                [IP2ndCategory.Other]: { title: 'אחר', description: '' },
                [IP2ndCategory.Issue1]: { title: 'קונפליקט לא פתור' },
                [IP2ndCategory.Issue2]: { title: 'חוסר הבנה' },
                [IP2ndCategory.Issue3]: { title: 'העלאת נושא רגיש' },
                [IP2ndCategory.Issue4]: { title: 'שיתוף במחשבות ורגשות' }
            }
        },

        [IP1stCategory.SpaceAndPrivacy]: {
            title: 'מרחב ופרטיות',
            iconSrc: svgOnePeople,
            sub_categories: {
                [IP2ndCategory.Other]: { title: 'אחר', description: '' },
                [IP2ndCategory.Issue1]: { title: 'פרטיות בבית' },
                [IP2ndCategory.Issue2]: { title: 'טלפון נייד ורשתות חברתיות' },
                [IP2ndCategory.Issue3]: { title: 'זמן עם עצמי' },
                [IP2ndCategory.Issue4]: { title: 'זמן עם חברים.ות / משפחה' }
            }
        },

        [IP1stCategory.Other]: {
            title: 'אחר',
            iconSrc: svgQuestionMark,
            description: 'כללי',
            sub_categories: {
                [IP2ndCategory.Other]: { title: 'אחר', description: '' }
            }
        }
    }
}

// export const interPersonalTopicsDictionary = {
//     major_categories: {

//         [IP1stCategory.HomeAssignments]: {
//             title: 'לוחות זמנים ומטלות בית',
//             icon: FASolidIcons.faHouseUser,
//             sub_categories: {
//                 [IP2ndCategory.Other]: { title: 'אחר', description: '' },
//                 [IP2ndCategory.Issue1]: { title: 'שינויים בלוחות זמנים שנקבעו' },
//                 [IP2ndCategory.Issue2]: { title: 'תפקידים ואחריות בבית' },
//                 [IP2ndCategory.Issue3]: { title: 'ביצוע מטלות' },
//                 [IP2ndCategory.Issue4]: { title: 'סדר ונקיון בבית' }
//             }
//         },

//         [IP1stCategory.School]: {
//             title: 'לימודים ובי"ס',
//             icon: FASolidIcons.faBookReader,
//             sub_categories: {
//                 [IP2ndCategory.Other]: { title: 'אחר', description: '' },
//                 [IP2ndCategory.Issue1]: { title: 'שיעורי בית' },
//                 [IP2ndCategory.Issue2]: { title: 'ציונים ומבחנים' },
//                 [IP2ndCategory.Issue3]: { title: 'הגעה לבית הספר' },
//                 [IP2ndCategory.Issue4]: { title: 'קשר עם המורה/מנהל' },
//                 [IP2ndCategory.Issue5]: { title: 'השתלבות חברתית בבית הספר' }
//             }
//         },

//         [IP1stCategory.LeisureTime]: {
//             title: 'זמן פנאי ומסכים',
//             icon: FASolidIcons.faComputer,
//             sub_categories: {
//                 [IP2ndCategory.Other]: { title: 'אחר', description: '' },
//                 [IP2ndCategory.Issue1]: { title: 'זמני מסך' },
//                 [IP2ndCategory.Issue2]: { title: 'טלפון נייד ורשתות חברתיות' },
//                 [IP2ndCategory.Issue3]: { title: 'מפגש משפחתי' },
//                 [IP2ndCategory.Issue4]: { title: 'יציאה / נסיעה / חופשה' },
//                 [IP2ndCategory.Issue5]: { title: 'זמן איכות יחד' },
//                 [IP2ndCategory.Issue6]: { title: 'תחביבים חוגים ותנועות נוער' }
//             }
//         },

//         [IP1stCategory.Relationships]: {
//             title: 'תקשורת ומערכות יחסים',
//             icon: FASolidIcons.faUserFriends,
//             sub_categories: {
//                 [IP2ndCategory.Other]: { title: 'אחר', description: '' },
//                 [IP2ndCategory.Issue1]: { title: 'קונפליקט לא פטור' },
//                 [IP2ndCategory.Issue2]: { title: 'העלאת נושא מסויים' },
//                 [IP2ndCategory.Issue3]: { title: 'התעניינות בנושא מסויים' },
//                 [IP2ndCategory.Issue4]: { title: 'יחסים עם קרובי משפחה וחברים' },
//                 [IP2ndCategory.Issue5]: { title: 'שיתוף במחשבות / תחושות / רגשות' }
//             }
//         },

//         [IP1stCategory.HomeEconomy]: {
//             title: 'נושאים כלכליים',
//             icon: FASolidIcons.faMoneyBill,
//             sub_categories: {
//                 [IP2ndCategory.Other]: { title: 'אחר', description: '' },
//                 [IP2ndCategory.Issue1]: { title: 'דמי כיס' },
//                 [IP2ndCategory.Issue2]: { title: 'קבלה / קנייה של משהוא' },
//                 [IP2ndCategory.Issue3]: { title: 'קשיים כלכליים' },
//                 [IP2ndCategory.Issue4]: { title: 'הוצאה לא מתוכננת' }
//             }
//         },
//         [IP1stCategory.SpaceAndPrivacy]: {
//             title: 'מרחב ופרטיות',
//             icon: FASolidIcons.faPeopleRoof,
//             sub_categories: {
//                 [IP2ndCategory.Other]: { title: 'אחר', description: '' },
//                 [IP2ndCategory.Issue1]: { title: 'פרטיות בבית' },
//                 [IP2ndCategory.Issue2]: { title: 'טלפון נייד ורשתות חברתיות' },
//                 [IP2ndCategory.Issue3]: { title: 'זמן עם עצמי' },
//                 [IP2ndCategory.Issue4]: { title: 'זמן עם חברים.ות / משפחה' }
//             }
//         },

//         [IP1stCategory.Health]: {
//             title: 'בריאות',
//             icon: FASolidIcons.faHeartbeat,
//             sub_categories: {
//                 [IP2ndCategory.Other]: { title: 'אחר', description: '' },
//                 [IP2ndCategory.Issue1]: { title: 'תזונה והרגלי אכילה' },
//                 [IP2ndCategory.Issue2]: { title: 'שינה' },
//                 [IP2ndCategory.Issue3]: { title: 'פעילות גופנית' },
//                 [IP2ndCategory.Issue4]: { title: 'מנוחה' },
//                 [IP2ndCategory.Issue5]: { title: 'מתח וסטרס' }
//             }
//         },

//         [IP1stCategory.Other]: {
//             title: 'אחר',
//             icon: FASolidIcons.faQuestion,
//             description: '',
//             sub_categories: {
//                 [IP2ndCategory.Other]: { title: 'אחר', description: 'כל נושא אחר' }
//             }
//         }
//     }
// }


export enum TopicCategoryLevel {
    Level_0 = -1,
    Level_1 = 0,
    Level_2 = 1
}

type DctType = { [key: string]: string }
type Topics1stLevelNestedDctType = { [key: string]: string | DctType }
type Topics2ndLevelNestedDctType = { [key: string]: Topics1stLevelNestedDctType }

export interface InterPersonalTopicsProps {
    topics: Topics2ndLevelNestedDctType;
    selectedCategories: ICategories;
    selected: boolean;
    active: boolean;
    onTopicSelection: (selectedCategories: ICategories) => void;
    doOnRender: () => void;
}

interface ICategories {
    level: TopicCategoryLevel;
    topics_key: Array<string>;
    topics_titles: Array<string>;
}

export const InterPersonalTopics = ({ topics, active, selected, selectedCategories, doOnRender, onTopicSelection }: InterPersonalTopicsProps) => {

    const [categories, setCategories] =
        useState<ICategories>(selected ?
            selectedCategories : { level: TopicCategoryLevel.Level_0, topics_key: [], topics_titles: [] })
    const [topicSelected, setTopicSelected] = useState(selected);

    // const composeHebMsg = useCallback((title1: string, title2: string) => {
    //     let intro1 = title1 ? `אתה מעלה בעיה בין אישית הקשורה לנושאי ${title1}` : ''
    //     let intro2 = title2 ? `בעיקר קשיים הקשורים ב ${title2}` : ''
    //     return `${intro1} ${intro2} זה המקום לתאר את אשר ליבך, הרגש בנוח לתאר כל דבר שעולה בדעתך, כל מה שנאמר כאן נשאר ביננו`.trim()
    // }, [])

    const getCardColorCls = useCallback((cardIdx: number) => {
        let bootstrap_color_cls = [
            'bg-primary text-white',
            'bg-secondary text-white',
            'bg-success text-white',
            'bg-danger text-white',
            'bg-warning text-white',
            'bg-info text-white']

        return topicSelected ? 'bg-white text-dark' : bootstrap_color_cls[cardIdx % bootstrap_color_cls.length]
    }, [topicSelected])

    let level_topics =
        categories.level === TopicCategoryLevel.Level_0 ?
            topics :
            categories.level === TopicCategoryLevel.Level_1 ?
                topics[categories.topics_key[TopicCategoryLevel.Level_1]].sub_categories :
                categories.level === TopicCategoryLevel.Level_2 ?
                    {
                        [categories.topics_key[TopicCategoryLevel.Level_2]]:
                            (topics[categories.topics_key[TopicCategoryLevel.Level_1]]
                                .sub_categories as DctType)[categories.topics_key[TopicCategoryLevel.Level_2]]
                    } : {};

    useEffect(() => {
        doOnRender()
    }, [doOnRender])

    useEffect(() => {
        if (topicSelected && active) {
            onTopicSelection(categories)
        }

    }, [onTopicSelection, topicSelected, active, categories])

    return (

        <div className={topicSelected ? "disabled" : "enabled"}>

            <div className="row row-cols-1 row-cols-md-3 g-4">
                {
                    categories.level === TopicCategoryLevel.Level_1 && !topicSelected &&

                    <div className="card h-100 topic-card go-back-card bg-light text-dark"
                        onClick={(evt: any) => {
                            setCategories({
                                level: TopicCategoryLevel.Level_0,
                                topics_key: [],
                                topics_titles: []
                            })
                        }}>
                        <div className="card-body">
                            <div>
                                <img className="card-img-bottom" src={`${getSVGURI(FASolidIcons.faArrowRight)}`} alt="" />
                            </div>
                        </div>
                    </div>
                }

                {Object.entries(level_topics).map(([t_key, t_dct], idx) => {

                    let caption =
                        (categories.level === TopicCategoryLevel.Level_0 && t_key === String(IP1stCategory.Other)) ||
                            (categories.level === TopicCategoryLevel.Level_1 && t_key === String(IP2ndCategory.Other)) ?
                            t_dct.description : t_dct.title;

                    let topics_titles = categories.level <= TopicCategoryLevel.Level_1 ?
                        [...categories.topics_titles, caption] : [...categories.topics_titles];

                    return (
                        <div className={`card h-100 topic-card ${getCardColorCls(idx)}`} key={t_key}

                            onClick={(evt: any) => {

                                if (
                                    categories.level === TopicCategoryLevel.Level_1 ||
                                    t_key === String(IP1stCategory.Other)) {
                                    setTopicSelected(true)
                                }

                                setCategories({
                                    level: categories.level + 1,
                                    topics_key: [...categories.topics_key, t_key],
                                    topics_titles: topics_titles
                                })

                            }} >

                            <div className="card-body">
                                {topicSelected ?
                                    <>
                                        <div className="card-title h5">
                                            {topics_titles[0]}
                                        </div>
                                        {
                                            categories.level === TopicCategoryLevel.Level_2 &&
                                            <div>
                                                {topics_titles[1]}
                                            </div>
                                        }
                                    </>
                                    :
                                    <>
                                        <div className="card-title h5">
                                            <small>
                                                {t_dct.title}
                                            </small>
                                        </div>
                                        {t_dct.icon &&
                                            <img className="card-img-bottom" src={`${getSVGURI(t_dct.icon)}`} alt="" />}
                                    </>
                                }
                            </div>
                        </div>
                    )
                }
                )}

            </div>
        </div>

    )
};
