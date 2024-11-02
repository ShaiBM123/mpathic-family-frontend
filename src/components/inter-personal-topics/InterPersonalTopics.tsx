import {useState} from "react";
import { Container, Row, Col, Form, Button, Card } from "react-bootstrap";
import { faSquareXmark, faSquarePlus, faSquareMinus } from '@fortawesome/free-solid-svg-icons'

enum IP1stCategory {
    None,
    Other, //'אחר',
    Work, //'עבודה',
    Study, //'לימודים',
    HomeAndFamily, //'בית ומשפחה',
    Relationships, //'מערכות יחסים',
    Health //'בריאות'
}

enum IP2ndCategory {
    None,
    Other,
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
    GuiltAndResentment
}

// type IPTopicsDictionaryType = {
//     [x in IP1stCategory]? : string | {[x in IP2ndCategory]? : string};
//   };

export const IPTopicsDictionary= {
    [IP1stCategory.Other]: {title: 'other'},

    [IP1stCategory.Work]: {description: 'other', 
        [IP2ndCategory.Other]: {title: '', description: ''},
        [IP2ndCategory.CommunicationBarriers]: {title: '', description: ''},
        [IP2ndCategory.PeerConflicts]: {title: '', description: ''},
        [IP2ndCategory.LackOfCooperation]: {title: '', description: ''},
        [IP2ndCategory.OfficePolitics]: {title: '', description: ''},
        [IP2ndCategory.Competitiveness]: {title: '', description: ''},
        [IP2ndCategory.BullyingAndHarassment]: {title: '', description: ''},
        [IP2ndCategory.CulturalDifferences]: {title: '', description: ''},
        [IP2ndCategory.UnclearRoleDefinitions]: {title: '', description: ''},
        [IP2ndCategory.ResistanceToChange]: {title: '', description: ''}
    },

    [IP1stCategory.Study]: {description: 'other',
        [IP2ndCategory.Other]: {title: '', description: ''}, 
        [IP2ndCategory.CommunicationBarriers]: {title: '', description: ''},
        [IP2ndCategory.PeerConflicts]: {title: '', description: ''},
        [IP2ndCategory.LackOfCooperation]: {title: '', description: ''},
        [IP2ndCategory.Competitiveness]: {title: '', description: ''},
        [IP2ndCategory.AuthorityTensions]: {title: '', description: ''},
        [IP2ndCategory.BullyingAndHarassment]: {title: '', description: ''},
        [IP2ndCategory.SocialIsolationAndLoneliness]: {title: '', description: ''},
        [IP2ndCategory.CulturalDifferences]: {title: '', description: ''},
        [IP2ndCategory.LearningStyleDifferences]: {title: '', description: ''},
        [IP2ndCategory.LackOfEmotionalSupport]: {title: '', description: ''}
    
    },

    [IP1stCategory.HomeAndFamily]: {description: 'other', 
        [IP2ndCategory.Other]: {title: '', description: ''},
        [IP2ndCategory.CommunicationBarriers]: {title: '', description: ''},
        [IP2ndCategory.SiblingRivalry]: {title: '', description: ''},
        [IP2ndCategory.ParentalConflicts]: {title: '', description: ''},
        [IP2ndCategory.LackOfQualityTime]: {title: '', description: ''},
        [IP2ndCategory.FinancialStress]: {title: '', description: ''},
        [IP2ndCategory.UnclearRoleDefinitions]: {title: '', description: ''},
        [IP2ndCategory.GenerationalGaps]: {title: '', description: ''},
        [IP2ndCategory.LackOfEmotionalSupport]: {title: '', description: ''},
        [IP2ndCategory.ConflictsOverHouseholdResponsibilities]: {title: '', description: ''},
        [IP2ndCategory.PrivacyConcerns]: {title: '', description: ''}
    },

    [IP1stCategory.Relationships]: {description: 'other', 
        [IP2ndCategory.Other]: {title: '', description: ''},
        [IP2ndCategory.CommunicationBarriers]: {title: '', description: ''},
        [IP2ndCategory.TrustIssues]: {title: '', description: ''},
        [IP2ndCategory.Jealousy]: {title: '', description: ''},
        [IP2ndCategory.ConflictingPriorities]: {title: '', description: ''},
        [IP2ndCategory.BoundaryIssues]: {title: '', description: ''},
        [IP2ndCategory.DifferentValues]: {title: '', description: ''},
        [IP2ndCategory.Envy]: {title: '', description: ''},
        [IP2ndCategory.SocialPressure]: {title: '', description: ''},
        [IP2ndCategory.UnresolvedConflicts]: {title: '', description: ''}
    },

    [IP1stCategory.Health]: {description: 'other', 
        [IP2ndCategory.Other]: {title: '', description: ''},
        [IP2ndCategory.CommunicationBarriers]: {title: '', description: ''},
        [IP2ndCategory.EmotionalStress]: {title: '', description: ''},
        [IP2ndCategory.RoleReversal]: {title: '', description: ''},
        [IP2ndCategory.DependencyIssues]: {title: '', description: ''},
        [IP2ndCategory.FinancialStress]: {title: '', description: ''},
        [IP2ndCategory.PrivacyConcerns]: {title: '', description: ''},
        [IP2ndCategory.DifferingOpinionsOnTreatment]: {title: '', description: ''},
        [IP2ndCategory.LifestyleChanges]: {title: '', description: ''},
        [IP2ndCategory.SocialIsolationAndLoneliness]: {title: '', description: ''},
        [IP2ndCategory.GuiltAndResentment]: {title: '', description: ''}
    },
}

export interface InterPersonalTopicsProps {
    active: Boolean;
    onTopicSelection: ( promptMsg: string ) => void ; 
}

export const InterPersonalTopics = ({active, onTopicSelection}: InterPersonalTopicsProps) => {
    const [firstCategoryTopic, setFirstCategoryTopic] = useState(0);
    const [secondCategoryTopic, setSecondCategoryTopic] = useState(0);

    // const itemsRef = useRef(new Array());
    const composePromptMsg = () => {
        let msg = ``
        return ` ${msg}`
    }

    return(
		<Container className={active ? "enabled" : "disabled"}
                    bsPrefix="container d-flex flex-column justify-content-center align-items-center">

 
        </Container>

    )
};
