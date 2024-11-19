import {useState, useCallback} from "react";
import {Container, Row, Col, Form, Button, Card, CardColumns, CardDeck } from "react-bootstrap";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowRight } from '@fortawesome/free-solid-svg-icons'

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
            sub_categories:{
                [IP2ndCategory.Other]: {title: 'אחר'},
                [IP2ndCategory.Issue1]: {title: 'שינויים בלוחות זמנים שנקבעו'},
                [IP2ndCategory.Issue2]: {title: 'תפקידים ואחריות בבית'},
                [IP2ndCategory.Issue3]: {title: 'ביצוע מטלות'},
                [IP2ndCategory.Issue4]: {title: 'סדר ונקיון בבית'}
            }
        },

        [IP1stCategory.School]: {
            title: 'לימודים ובי"ס', 
            sub_categories:{
                [IP2ndCategory.Other]: {title: 'אחר'}, 
                [IP2ndCategory.Issue1]: {title: 'שיעורי בית'},
                [IP2ndCategory.Issue2]: {title: 'ציונים ומבחנים'},
                [IP2ndCategory.Issue3]: {title: 'הגעה לבית הספר'},
                [IP2ndCategory.Issue4]: {title: 'קשר עם המורה/מנהל'},
                [IP2ndCategory.Issue5]: {title: 'השתלבות חברתית בבית הספר'}
            }
        },

        [IP1stCategory.LeisureTime]: {
            title: 'זמן פנאי ומסכים', 
            sub_categories:{ 
                [IP2ndCategory.Other]: {title: 'אחר'},
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
            sub_categories:{ 
                [IP2ndCategory.Other]: {title: 'אחר'},
                [IP2ndCategory.Issue1]: {title: 'קונפליקט לא פטור'},
                [IP2ndCategory.Issue2]: {title: 'העלאת נושא מסויים'},
                [IP2ndCategory.Issue3]: {title: 'התעניינות בנושא מסויים'},
                [IP2ndCategory.Issue4]: {title: 'יחסים עם קרובי משפחה וחברים'},
                [IP2ndCategory.Issue5]: {title: 'שיתוף במחשבות / תחושות / רגשות'}
            }
        },

        [IP1stCategory.HomeEconomy]: {
            title: 'נושאים כלכליים',  
            sub_categories:{ 
                [IP2ndCategory.Other]: {title: 'אחר'},
                [IP2ndCategory.Issue1]: {title: 'דמי כיס'},
                [IP2ndCategory.Issue2]: {title: 'קבלה / קנייה של משהוא'},
                [IP2ndCategory.Issue3]: {title: 'קשיים כלכליים'},
                [IP2ndCategory.Issue4]: {title: 'הוצאה לא מתוכננת'}
            }
        },
        [IP1stCategory.SpaceAndPrivacy]: {
            title: 'מרחב ופרטיות',  
            sub_categories:{ 
                [IP2ndCategory.Other]: {title: 'אחר'},
                [IP2ndCategory.Issue1]: {title: 'פרטיות בבית'},
                [IP2ndCategory.Issue2]: {title: 'טלפון נייד ורשתות חברתיות'},
                [IP2ndCategory.Issue3]: {title: 'זמן עם עצמי'},
                [IP2ndCategory.Issue4]: {title: 'זמן עם חברים.ות / משפחה'}
            }
        },

        [IP1stCategory.Health]: {
            title: 'בריאות',  
            sub_categories:{ 
                [IP2ndCategory.Other]: {title: 'אחר'},
                [IP2ndCategory.Issue1]: {title: 'תזונה והרגלי אכילה'},
                [IP2ndCategory.Issue2]: {title: 'שינה'},
                [IP2ndCategory.Issue3]: {title: 'פעילות גופנית'},
                [IP2ndCategory.Issue4]: {title: 'מנוחה'},
                [IP2ndCategory.Issue5]: {title: 'מתח וסטרס'}
            }
        },

        [IP1stCategory.Other]: {
            title: 'אחר', 
            description: 'כל בעיה בין אישית אחרת',             
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
    active: Boolean;
    onTopicSelection: (msg: string) => void ; 
}

export const InterPersonalTopics = ({topics, active, onTopicSelection}: InterPersonalTopicsProps) => {
    const [categoryTopic, setCategoryTopic] = useState<Array<string>>([])
    const [categoryLevel, setCategoryLevel] = useState(CategoryLevel.Level_0);

    const composeHebMsg = useCallback((title1: string, title2: string) => {
        let intro1 = title1 ? `נראה שיש לך בעיה בין אישית הקשורה לנושאי ${title1}` : ''
        let intro2 = title2 ? `בעיקר קשיים הקשורים ב ${title2}` : ''
        return `${intro1} ${intro2} זה המקום לתאר את אשר ליבך, הרגש בנוח לתאר כל דבר שעולה בדעתך, כל מה שנאמר כאן נשאר ביננו`.trim()
    }, [])

    const getCardColorCls = useCallback((isSelected: Boolean, cardIdx: number) => {
        let bootstrap_color_cls = [
            'bg-primary text-white',
            'bg-secondary text-white',
            'bg-success text-white',
            'bg-danger text-white',
            'bg-warning text-white',
            'bg-info text-white']

        return isSelected ? 'bg-light text-dark' : bootstrap_color_cls[cardIdx % bootstrap_color_cls.length] 
    }, [])

    let level_topics = 
        categoryLevel === CategoryLevel.Level_0 ? 
            topics : 
                categoryLevel === CategoryLevel.Level_1 ? 
                    topics[categoryTopic[CategoryLevel.Level_1]].sub_categories :
                        categoryLevel === CategoryLevel.Level_2 ?
                            {
                                [categoryTopic[CategoryLevel.Level_2]]: 
                                (topics[categoryTopic[CategoryLevel.Level_1]]
                                    .sub_categories as DctType)[categoryTopic[CategoryLevel.Level_2]]
                            }: {};

    return(

         <div className={active ? "enabled" : "disabled"}> 
            { categoryLevel === CategoryLevel.Level_1 && active &&
                <Button className='mb-2 bg-white border-dark'>
                    <FontAwesomeIcon color={"black"} icon={faArrowRight} size={'lg'} onClick={() => {
                        setCategoryTopic([])
                        setCategoryLevel(CategoryLevel.Level_0)
                    }}/>
                </Button>
            }

            <CardColumns>

                {Object.entries(level_topics).map(([ip_topic_key, ip_topic_dct], idx) => 

                    <Card bsPrefix={`card topic-card ${getCardColorCls(!active, idx)}`} key={ip_topic_key} onClick={(evt: any)=>{

                            console.log(evt.target)
                            let category_topics = [...categoryTopic, ip_topic_key]

                            setCategoryTopic(category_topics)

                            if(categoryLevel === CategoryLevel.Level_0)
                            {
                                setCategoryLevel(CategoryLevel.Level_1)
                                if (ip_topic_key === String(IP1stCategory.Other))
                                {
                                    onTopicSelection(composeHebMsg('', ''))
                                }  
                            }
                            else if(categoryLevel === CategoryLevel.Level_1)
                            {
                                setCategoryLevel(CategoryLevel.Level_2)
                                let title1 = topics[categoryTopic[CategoryLevel.Level_1]].title as string

                                if (ip_topic_key === String(IP2ndCategory.Other))
                                {
                                    onTopicSelection(composeHebMsg(title1, ''))
                                }
                                else {
                                    let title2 = ((level_topics as Topics1stLevelNestedDctType)[ip_topic_key] as DctType).title 
                                    onTopicSelection(composeHebMsg(title1, title2))
                                }
                            }
                        }} >

                        <Card.Body>
                            <Card.Title>
                                <small>
                                    {ip_topic_dct.title}
                                </small>
                            </Card.Title>
                            {/* <Card.Text>
                                <small>
                                    {ip_topic_dct.description}
                                </small>
                            </Card.Text> */}
                        </Card.Body>
                    </Card>
                    )
                }
            </CardColumns>
         </div>    

    )
};
