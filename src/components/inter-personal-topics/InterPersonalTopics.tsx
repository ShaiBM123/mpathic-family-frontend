import {useState, useCallback} from "react";
import {Container, Row, Col, Form, Button, Card, CardColumns, CardDeck } from "react-bootstrap";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowRight, faCircle, faCheck } from '@fortawesome/free-solid-svg-icons'
import * as FASolidIcons from "@fortawesome/free-solid-svg-icons";
import * as FABrandIcons from "@fortawesome/free-brands-svg-icons";
import * as FARegularIcons from "@fortawesome/free-regular-svg-icons";
import {getSVGURI} from "../../AppUtils";

enum IP1stCategory {
    None, 
    HomeAssignments, 
    School, 
    LeisureTime,
    Relationships,
    HomeEconomy,
    SpaceAndPrivacy,
    Health,
    Other 
}

enum IP2ndCategory {
    None,
    Issue1,
    Issue2,
    Issue3,
    Issue4,
    Issue5,
    Issue6,
    Other
}

export const interPersonalTopicsDictionary= {
    major_categories:{

        [IP1stCategory.HomeAssignments]: {
            title: 'לוחות זמנים ומטלות בית', 
            icon: FASolidIcons.faHouseUser,           
            sub_categories:{
                [IP2ndCategory.Other]: {title: 'אחר', description: 'נושא חופשי'},
                [IP2ndCategory.Issue1]: {title: 'שינויים בלוחות זמנים שנקבעו'},
                [IP2ndCategory.Issue2]: {title: 'תפקידים ואחריות בבית'},
                [IP2ndCategory.Issue3]: {title: 'ביצוע מטלות'},
                [IP2ndCategory.Issue4]: {title: 'סדר ונקיון בבית'}
            }
        },

        [IP1stCategory.School]: {
            title: 'לימודים ובי"ס',
            icon: FASolidIcons.faBookReader, 
            sub_categories:{
                [IP2ndCategory.Other]: {title: 'אחר', description: 'נושא חופשי'}, 
                [IP2ndCategory.Issue1]: {title: 'שיעורי בית'},
                [IP2ndCategory.Issue2]: {title: 'ציונים ומבחנים'},
                [IP2ndCategory.Issue3]: {title: 'הגעה לבית הספר'},
                [IP2ndCategory.Issue4]: {title: 'קשר עם המורה/מנהל'},
                [IP2ndCategory.Issue5]: {title: 'השתלבות חברתית בבית הספר'}
            }
        },

        [IP1stCategory.LeisureTime]: {
            title: 'זמן פנאי ומסכים', 
            icon: FASolidIcons.faFutbol,
            sub_categories:{ 
                [IP2ndCategory.Other]: {title: 'אחר', description: 'נושא חופשי'},
                [IP2ndCategory.Issue1]: {title: 'זמני מסך'},
                [IP2ndCategory.Issue2]: {title: 'טלפון נייד ורשתות חברתיות'},
                [IP2ndCategory.Issue3]: {title: 'מפגש משפחתי'},
                [IP2ndCategory.Issue4]: {title: 'יציאה / נסיעה / חופשה'},
                [IP2ndCategory.Issue5]: {title: 'זמן איכות יחד'},
                [IP2ndCategory.Issue6]: {title: 'תחביבים חוגים ותנועות נוער'}
            }
        },

        [IP1stCategory.Relationships]: {
            title: 'תקשורת ומערכות יחסים', 
            icon: FASolidIcons.faUserFriends,
            sub_categories:{ 
                [IP2ndCategory.Other]: {title: 'אחר', description: 'נושא חופשי'},
                [IP2ndCategory.Issue1]: {title: 'קונפליקט לא פטור'},
                [IP2ndCategory.Issue2]: {title: 'העלאת נושא מסויים'},
                [IP2ndCategory.Issue3]: {title: 'התעניינות בנושא מסויים'},
                [IP2ndCategory.Issue4]: {title: 'יחסים עם קרובי משפחה וחברים'},
                [IP2ndCategory.Issue5]: {title: 'שיתוף במחשבות / תחושות / רגשות'}
            }
        },

        [IP1stCategory.HomeEconomy]: {
            title: 'נושאים כלכליים',  
            icon: FASolidIcons.faMoneyBill,
            sub_categories:{ 
                [IP2ndCategory.Other]: {title: 'אחר', description: 'נושא חופשי'},
                [IP2ndCategory.Issue1]: {title: 'דמי כיס'},
                [IP2ndCategory.Issue2]: {title: 'קבלה / קנייה של משהוא'},
                [IP2ndCategory.Issue3]: {title: 'קשיים כלכליים'},
                [IP2ndCategory.Issue4]: {title: 'הוצאה לא מתוכננת'}
            }
        },
        [IP1stCategory.SpaceAndPrivacy]: {
            title: 'מרחב ופרטיות', 
            icon: FASolidIcons.faPeopleRoof, 
            sub_categories:{ 
                [IP2ndCategory.Other]: {title: 'אחר', description: 'נושא חופשי'},
                [IP2ndCategory.Issue1]: {title: 'פרטיות בבית'},
                [IP2ndCategory.Issue2]: {title: 'טלפון נייד ורשתות חברתיות'},
                [IP2ndCategory.Issue3]: {title: 'זמן עם עצמי'},
                [IP2ndCategory.Issue4]: {title: 'זמן עם חברים.ות / משפחה'}
            }
        },

        [IP1stCategory.Health]: {
            title: 'בריאות',  
            icon: FASolidIcons.faHeartbeat,
            sub_categories:{ 
                [IP2ndCategory.Other]: {title: 'אחר', description: 'נושא חופשי'},
                [IP2ndCategory.Issue1]: {title: 'תזונה והרגלי אכילה'},
                [IP2ndCategory.Issue2]: {title: 'שינה'},
                [IP2ndCategory.Issue3]: {title: 'פעילות גופנית'},
                [IP2ndCategory.Issue4]: {title: 'מנוחה'},
                [IP2ndCategory.Issue5]: {title: 'מתח וסטרס'}
            }
        },

        [IP1stCategory.Other]: {
            title: 'אחר', 
            icon: FASolidIcons.faQuestion,
            description: 'נושא חופשי',             
            sub_categories:{ 
                [IP2ndCategory.Other]: {title: 'אחר', description: 'כל נושא אחר'}}}
    }   
}


export enum CategoryLevel {
    Level_0 = -1,
    Level_1 = 0,
    Level_2 = 1
}

type DctType = {[key: string]: string }
type Topics1stLevelNestedDctType = {[key: string]: string | DctType}
type Topics2ndLevelNestedDctType = { [key: string]: Topics1stLevelNestedDctType }

export interface InterPersonalTopicsProps {
    topics: Topics2ndLevelNestedDctType;
    onTopicSelection: (msg: string) => void ; 
}

interface ICategories {
    level: CategoryLevel;
    topics_key: Array<string>;
    topics_titles: Array<string>;
}

export const InterPersonalTopics = ({topics, onTopicSelection}: InterPersonalTopicsProps) => {

    const [categories, setCategories] = 
        useState<ICategories>({level: CategoryLevel.Level_0, topics_key: [], topics_titles: []})
    const [topicSelected, setTopicSelected] = useState(false);

    const composeHebMsg = useCallback((title1: string, title2: string) => {
        let intro1 = title1 ? `אתה מעלה בעיה בין אישית הקשורה לנושאי ${title1}` : ''
        let intro2 = title2 ? `בעיקר קשיים הקשורים ב ${title2}` : ''
        return `${intro1} ${intro2} זה המקום לתאר את אשר ליבך, הרגש בנוח לתאר כל דבר שעולה בדעתך, כל מה שנאמר כאן נשאר ביננו`.trim()
    }, [])

    const getCardColorCls = useCallback((cardIdx: number) => {
        let bootstrap_color_cls = [
            'bg-primary text-white',
            'bg-secondary text-white',
            'bg-success text-white',
            'bg-danger text-white',
            'bg-warning text-white',
            'bg-info text-white']

        return topicSelected ? 'bg-light text-dark' : bootstrap_color_cls[cardIdx % bootstrap_color_cls.length] 
    }, [topicSelected])

    let level_topics = 
        categories.level === CategoryLevel.Level_0 ? 
            topics : 
            categories.level === CategoryLevel.Level_1 ? 
                    topics[categories.topics_key[CategoryLevel.Level_1]].sub_categories :
                    categories.level === CategoryLevel.Level_2 ?
                            {
                                [categories.topics_key[CategoryLevel.Level_2]]: 
                                (topics[categories.topics_key[CategoryLevel.Level_1]]
                                    .sub_categories as DctType)[categories.topics_key[CategoryLevel.Level_2]]
                            }: {};

    return(

         <div className={topicSelected ? "disabled" : "enabled" }> 
            { 
                categories.level === CategoryLevel.Level_1 && !topicSelected &&
                <Button className='mb-2 bg-white border-dark'>
                    <FontAwesomeIcon color={"black"} icon={faArrowRight} size={'lg'} onClick={() => {
                        setCategories({level: CategoryLevel.Level_0, topics_key: [], topics_titles: []})
                    }}/>
                </Button>
            }

            <CardColumns>

                {Object.entries(level_topics).map(([t_key, t_dct], idx) => {
                    
                    // let caption = [String(IP1stCategory.Other), String(IP2ndCategory.Other)].includes(t_key) ? t_dct.description:  t_dct.title
                    // let topics_titles_2 = categories.level <= CategoryLevel.Level_1 ? [...categories.topics_titles, caption] : [...categories.topics_titles];
                    let caption = 
                    (categories.level === CategoryLevel.Level_0 && t_key === String(IP1stCategory.Other)) ||  
                    (categories.level === CategoryLevel.Level_1 && t_key === String(IP2ndCategory.Other)) ? 
                    t_dct.description:  t_dct.title; 

                    let topics_titles = categories.level <= CategoryLevel.Level_1 ? 
                        [...categories.topics_titles, caption] : [...categories.topics_titles];

                    return(
                        <Card 
                            bsPrefix={`card topic-card ${getCardColorCls(idx)}`} key={t_key} 
                            onClick={(evt: any)=>{
                                
                                setCategories({
                                    level: categories.level+1, 
                                    topics_key: [...categories.topics_key, t_key],
                                    topics_titles: topics_titles})

                                if(categories.level === CategoryLevel.Level_0)
                                {
                                    if (t_key === String(IP1stCategory.Other))
                                    {
                                        setTopicSelected(true)
                                        onTopicSelection(composeHebMsg('', ''))
                                    }  
                                }
                                else if(categories.level === CategoryLevel.Level_1)
                                {
                                    setTopicSelected(true)
                                    if (t_key === String(IP2ndCategory.Other))
                                    {
                                        onTopicSelection(composeHebMsg(topics_titles[0], ''))
                                    }
                                    else 
                                    {
                                        onTopicSelection(composeHebMsg(topics_titles[0], topics_titles[1]))
                                    }
                                }
                            }} >

                            <Card.Body>
                                {topicSelected ?  
                                    <>
                                        <Card.Title>
                                            {topics_titles[0]}
                                        </Card.Title>
                                        {
                                            categories.level === CategoryLevel.Level_2 &&
                                            <Card.Text>
                                                {topics_titles[1]}
                                            </Card.Text>
                                        }
                                    </>
                                    :
                                    <>
                                        <Card.Title>
                                            <small>
                                                {t_dct.title}
                                            </small>
                                        </Card.Title>
                                        { t_dct.icon && <Card.Img variant="bottom" src={`${getSVGURI(t_dct.icon)}`} /> }
                                    </>
                                }
                            </Card.Body>
                        </Card>
                    )}
                )}
            </CardColumns>
         </div>    

    )
};
