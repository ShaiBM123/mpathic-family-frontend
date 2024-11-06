import {useState} from "react";
import {Row, Col, Form, Button, Card, CardColumns } from "react-bootstrap";
// import { faSquareXmark, faSquarePlus, faSquareMinus } from '@fortawesome/free-solid-svg-icons'

enum IP1stCategory {
    None, 
    Work, 
    Study, 
    HomeAndFamily,
    Relationships,
    Health,
    Other 
}

enum IP2ndCategory {
    None,
    OfficePolitics,
    UnclearRoleDefinitions,
    ResistanceToChange,
    Competitiveness,
    CommunicationBarriers,
    PeerConflicts,
    LackOfCooperation,
    AuthorityTensions,
    BullyingAndHarassment,
    SocialIsolationAndLoneliness,
    CulturalDifferences,
    LearningStyleDifferences,
    LackOfEmotionalSupport,
    SiblingRivalry,
    ParentalConflicts,
    LackOfQualityTime,
    FinancialStress,
    GenerationalGaps,
    ConflictsOverHouseholdResponsibilities,
    PrivacyConcerns,
    TrustIssues,
    ConflictingPriorities,
    BoundaryIssues,
    DifferentValues,
    Envy,
    Jealousy,
    SocialPressure,
    UnresolvedConflicts,
    EmotionalStress,
    RoleReversal,
    DependencyIssues,
    DifferingOpinionsOnTreatment,
    LifestyleChanges,
    GuiltAndResentment,
    Other
}

export const interPersonalTopicsDictionary= {
    inter_personal_categories:{

        [IP1stCategory.Work]: {
            title: 'עבודה', 
            description: 'בעיות אלה עשויות להשפיע לרעה על מורל העובדים ועל הפרודוקטיביות במקום העבודה', 
            sub_categories:{

                [IP2ndCategory.Other]: {title: 'אחר', description: 'כל נושא אחר הנובע מקשרים חברתיים בעבודה'},
                [IP2ndCategory.CommunicationBarriers]: {title: 'כשלים בתקשורת', description: 'בעיות בהעברת מסרים בין עובדים ומנהלים'},
                [IP2ndCategory.PeerConflicts]: {title: 'קונפליקטים במקום העבודה', description: 'עימותים הנובעים מהבדלים בערכים, בעמדות או באופי בין עובדים'},
                [IP2ndCategory.LackOfCooperation]: {title: 'חוסר עבודת צוות', description: 'חוסר יכולת או רצון לעבודה משותפת באופן יעיל'},
                [IP2ndCategory.OfficePolitics]: {title: 'פוליטיקה משרדית', description: 'מאבקי כוח והשפעה בין עובדים אשר יכולים להזיק לאווירה הכללית'},
                [IP2ndCategory.Competitiveness]: {title: 'קנאה ויריבות', description: 'תחושות קנאה ותחרותיות יתר בין עובדים שיכולים להוביל למתח'},
                [IP2ndCategory.BullyingAndHarassment]: {title: 'הטרדה ובריונות', description: 'מצבים של הצקה או הטרדה המתבטאים בצורה מילולית או פיזית מכוונת'},
                [IP2ndCategory.CulturalDifferences]: {title: 'בעיות של תרבות וגיוון', description: ' אי הבנות או חיכוכים הנובעים משונות תרבותית ואתנית'},
                [IP2ndCategory.UnclearRoleDefinitions]: {title: 'חוסר בהירות בהגדרת תפקידים', description: 'חוסר בהירות לגבי תחומי אחריות, מה שיכול ליצור חפיפות ומתח בין עובדים'},
                [IP2ndCategory.ResistanceToChange]: {title: 'התנגדות לשינויים', description: 'דינמיקה שלילית עקב התנגדות לשינויים מבניים או תהליכיים בארגון'}
            }
        },

        [IP1stCategory.Study]: {
            title: 'לימודים', 
            description: 'מצבים אלו יכולים להשפיע על האווירה הלימודית ועל תפקוד התלמידים והמורים / המרצים',
            sub_categories:{
                [IP2ndCategory.Other]: {title: 'אחר', description: 'כל נושא אחר הנובע מקשרים חברתיים במסגרת לימודית'}, 
                [IP2ndCategory.CommunicationBarriers]: {title: 'בעיות תקשורת', description: 'קשיים בהעברת או בהבנת מסרים בין תלמידים ומורים'},
                [IP2ndCategory.PeerConflicts]: {title: 'קונפליקטים בין תלמידים', description: 'חיכוכים או עימותים הנובעים מהבדלים אישיותיים, תרבותיים או ערכיים'},
                [IP2ndCategory.LackOfCooperation]: {title: 'חוסר שיתוף פעולה', description: 'חוסר יכולת לעבוד יחד בקבוצות, מה שמוביל להישגים נמוכים יותר'},
                [IP2ndCategory.Competitiveness]: {title: 'קנאה ותחרותיות', description: 'תחרות יתר בין תלמידים המביאה לקנאה ולחיכוכים'},
                [IP2ndCategory.AuthorityTensions]: {title: 'מתחים בין מורים לתלמידים', description: 'חוסר הבנות בין מורים לתלמידים או עומס במטלות שמובילים למתחים בכיתה'},
                [IP2ndCategory.BullyingAndHarassment]: {title: 'הצקות ובריונות', description: 'מצבים של הצקה או פגיעה אשר מבוססים על רקעים שונים'},
                [IP2ndCategory.SocialIsolationAndLoneliness]: {title: 'תחושת בידוד חברתי', description: 'תלמידים המרגישים מבודדים או לא שייכים במסגרת החברתית של הכיתה'},
                [IP2ndCategory.CulturalDifferences]: {title: 'שונות תרבותית', description: 'פערים תרבותיים שעשויים להוביל לאי הבנות או לחיכוכים'},
                [IP2ndCategory.LearningStyleDifferences]: {title: 'הבדלי סגנון למידה', description: 'סגנונות למידה שונים שקשה להתאים להם את תכנית הלימודים'},
                [IP2ndCategory.LackOfEmotionalSupport]: {title: 'העדר תמיכה רגשית', description: 'חוסר במערכות תמיכה רגשית המסייעות בהתמודדות עם לחצים ומצוקות'}
            }
        },

        [IP1stCategory.HomeAndFamily]: {
            title: 'בית ומשפחה', 
            description: 'בעיות אלו עשויות להשפיע על האווירה הכללית בבית ועל היחסים בין בני המשפחה',
            sub_categories:{ 
                [IP2ndCategory.Other]: {title: 'אחר', description: 'כל נושא אחר הנובע מקשרים חברתיים בבית או בין בני המשפחה'},
                [IP2ndCategory.CommunicationBarriers]: {title: 'בעיות תקשורת', description: 'חוסר בהירות או חוסר הבנה בהעברת מסרים בין חברים או בין בני המשפחה'},
                [IP2ndCategory.SiblingRivalry]: {title: 'יריבות בין אחים', description: 'תחרות או קונפליקט בין אחים על תשומת לב או משאבים משפחתיים אחרים'},
                [IP2ndCategory.ParentalConflicts]: {title: 'קונפליקטים בין הורים', description: 'חילוקי דעות בין הורים לגבי נושאים שונים, כגון גידול הילדים או ניהול הבית'},
                [IP2ndCategory.LackOfQualityTime]: {title: 'חוסר זמן איכות', description: 'חוסר זמן שמשפחה מבלה יחד, מה שיכול להוביל להתרחקות רגשית'},
                [IP2ndCategory.FinancialStress]: {title: 'לחץ כלכלי', description: 'מצבים של חוסר יציבות כלכלית המובילים למתח בין בני הבית'},
                [IP2ndCategory.UnclearRoleDefinitions]: {title: 'בלבול בתפקידי המשפחה', description: 'קושי להגדיר או לשמור על תפקידים ברורים בתוך המשפחה'},
                [IP2ndCategory.GenerationalGaps]: {title: 'פערים תרבותיים או דוריים', description: 'פערי ערכים ותפיסות בין דורות שונים במשפחה'},
                [IP2ndCategory.LackOfEmotionalSupport]: {title: 'חוסר תמיכה רגשית', description: ' תחושה שאין מי שיתמוך רגשית בזמנים קשים'},
                [IP2ndCategory.ConflictsOverHouseholdResponsibilities]: {title: 'חיכוכים סביב מטלות הבית', description: 'ויכוחים סביב חלוקה בלתי הוגנת או בלתי ברורה של מטלות הבית'},
                [IP2ndCategory.PrivacyConcerns]: {title: 'בעיות פרטיות', description: ' חוסר בכבוד לפרטיות האישית של בני המשפחה בתוך המרחב הביתי'}
            }
        },

        [IP1stCategory.Relationships]: {
            title: 'מערכות יחסים', 
            description: 'התמודדות עם בעיות אלו באופן בונה ומיטיב יכולה לתרום לשימור ושיפור הקשרים החברתיים והזוגיים', 
            sub_categories:{ 
                [IP2ndCategory.Other]: {title: 'אחר', description: 'כל נושא אחר הנובע מקשרים בין חברים או ממערכות יחסים'},
                [IP2ndCategory.CommunicationBarriers]: {title: 'מחסומי תקשורת', description: 'חוסר בהירות או הבנה בתקשורת בין חברים או בני זוג שיכולים להוביל למריבות'},
                [IP2ndCategory.TrustIssues]: {title: 'בעיות אמון', description: 'חשדות או חוסר אמון שעלולים לפגוע ביציבות ובקרבה של הקשר'},
                [IP2ndCategory.Jealousy]: {title: 'קנאה', description: 'תחושות קנאה הנובעות מחששות לאבד את הקשר או מיחסים עם אנשים אחרים'},
                [IP2ndCategory.ConflictingPriorities]: {title: 'סדרי עדיפויות מתנגשים', description: 'פערים בהעדפות או בכיוונים אישיים שיכולים ליצור חיכוכים'},
                [IP2ndCategory.BoundaryIssues]: {title: 'בעיות גבולות', description: 'חוסר כיבוד מרחב אישי או גבולות רגשיים של האחר'},
                [IP2ndCategory.DifferentValues]: {title: 'ערכים שונים', description: 'חיכוכים הנובעים מערכים או אמונות שונות בין חברים או בני זוג'},
                [IP2ndCategory.Envy]: {title: 'תחרות וקנאה', description: 'תחושות של תחרותיות יתר או השוואה עלולות להוביל למתח בקשר'},
                [IP2ndCategory.SocialPressure]: {title: 'לחץ חברתי', description: 'השפעת לחצים חברתיים שיכולה לגרום למתח או לשינויים בקשר'},
                [IP2ndCategory.UnresolvedConflicts]: {title: 'קונפליקטים לא פתורים', description: ' אי טיפול בקונפליקטים ישנים שממשיכים להפריע למערכת היחסים'}
            }
        },

        [IP1stCategory.Health]: {
            title: 'בריאות', 
            description: 'טיפול רגיש ומתחשב בבעיות אלה יכול לעזור להקל על המתח במערכות היחסים ולתמוך בריפוי ובתמיכה הנדרשים', 
            sub_categories:{ 
                [IP2ndCategory.Other]: {title: 'אחר', description: 'כל נושא אחר הקשור לבריאות'},
                [IP2ndCategory.CommunicationBarriers]: {title: 'כשלים בתקשורת רפואית', description: 'חוסר הבנה בין המטופל לצוות הרפואי או בתוך המשפחה לגבי מצב בריאותי'},
                [IP2ndCategory.EmotionalStress]: {title: 'לחץ רגשי', description: 'מתחים וחרדות שנוצרים בעקבות מצב בריאותי שמשפיעים על מערכות היחסים'},
                [IP2ndCategory.RoleReversal]: {title: 'היפוך תפקידים', description: 'שינוי בתפקידים במשפחה כאשר בן זוג או ילד נאלץ לטפל באדם חולה'},
                [IP2ndCategory.DependencyIssues]: {title: 'בעיות תלות', description: 'תחושת תלות יתר במטפל או בתחושת חנק מצד המטפל'},
                [IP2ndCategory.FinancialStress]: {title: 'עומס כלכלי', description: 'הוצאות רפואיות גבוהות שיכולות להוביל למתח בין בני משפחה'},
                [IP2ndCategory.PrivacyConcerns]: {title: 'חששות מפרטיות', description: 'שמירה על פרטיות החולה אל מול הצורך לשתף מידע עם הקרובים או המטפלים'},
                [IP2ndCategory.DifferingOpinionsOnTreatment]: {title: 'דעות שונות על טיפול', description: 'מחלוקות בין בני משפחה על תוכניות טיפול או התערבויות רפואיות'},
                [IP2ndCategory.LifestyleChanges]: {title: 'שינויים באורח חיים', description: 'הצורך לשנות הרגלים שעשוי לגרום לקונפליקטים בין המטופל לסביבה'},
                [IP2ndCategory.SocialIsolationAndLoneliness]: {title: 'בידוד ובדידות', description: ' תחושות בדידות שהמטופל חווה ויכולות להוביל לריחוק מיחסים קרובים'},
                [IP2ndCategory.GuiltAndResentment]: {title: 'רגשות אשמה וטינה', description: 'תחושות אשמה מצד המטופל על כך שהוא מהווה נטל, או תחושת טינה מצד המטפל'}
            }
        },

        [IP1stCategory.Other]: {title: 'אחר', description: 'כל בעיה בין אישית אחרת'}
    }   
}


export enum InterPersonalCategoryLevel {
    Level_1 = "1",
    Level_2 = "2"
}

export interface InterPersonalTopicsProps {
    topics: { [key: string]: {[key: string]: string | {[key: string]: string }} };
    active: Boolean;
    onTopicSelection: ( promptMsg: string ) => void ; 
}

export const InterPersonalTopics = ({topics, active, onTopicSelection}: InterPersonalTopicsProps) => {
    const [categoryTopic, setCategoryTopic] = useState("");
    const [categoryLevel, setCategoryLevel] = useState(InterPersonalCategoryLevel.Level_1);


    // const itemsRef = useRef(new Array());
    const composePromptMsg = () => {
        let msg = ``
        return ` ${msg}`
    }

    let level_topics = 
        categoryLevel === InterPersonalCategoryLevel.Level_1 ? topics : 
        categoryLevel === InterPersonalCategoryLevel.Level_2 ? topics[categoryTopic].sub_categories : 
        {};

    return(
		// <Container className={active ? "enabled" : "disabled"}
        //             bsPrefix="container d-flex flex-column justify-content-center align-items-center">

            <CardColumns>
                {Object.entries(level_topics).map(([ip_topic_key, ip_topic_dct], idx) => 

                    <Card bsPrefix={`card bg-custom-color-${idx+1}`} key={ip_topic_key} onClick={(evt: any)=>{

                            console.log(evt.target)
                            if(categoryLevel === InterPersonalCategoryLevel.Level_1)
                            {
                                setCategoryLevel(InterPersonalCategoryLevel.Level_2)
                                setCategoryTopic(ip_topic_key)
                            }
                            else if(categoryLevel === InterPersonalCategoryLevel.Level_2)
                            {
                                onTopicSelection(ip_topic_dct.description)
                            }
                        }} >

                        <Card.Body>
                            <Card.Title>
                                <small>
                                    {ip_topic_dct.title}
                                </small>
                            </Card.Title>
                            <Card.Text>
                                <small>
                                    {ip_topic_dct.description}
                                </small>
                            </Card.Text>
                        </Card.Body>
                    </Card>
                    )
                }
            </CardColumns>
                
        // </Container>

    )
};
