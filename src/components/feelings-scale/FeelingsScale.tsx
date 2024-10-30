import {useState} from "react";
import { Container, Row, Col, Form, Button, Card } from "react-bootstrap";
import { z } from 'zod';
import { zodResponseFormat } from 'openai/helpers/zod';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSquareXmark, faSquarePlus, faSquareMinus } from '@fortawesome/free-solid-svg-icons'
import {DropdownFeelingSelector, hebFeelings} from './FeelingsDropdown'

export const FeelingIntensityEnum = z.enum(["1", "2" , "3", "4", "5", "6", "7", "8", "9", "10"]);
// const FeelingIntensityEnum = z.nativeEnum(FeelingIntensityEnum);
export type FeelingIntensityEnumType = z.infer<typeof FeelingIntensityEnum>; 
export const Feeling = z.object({
    emotion_name: z.string(),
    emotion_intensity: FeelingIntensityEnum,
});
export const FeelingsArray = z.array(Feeling)
export type FeelingsArrayType = z.infer<typeof FeelingsArray>;
export const FeelingsResponseFormat = zodResponseFormat(z.object({feelings: FeelingsArray}), "feelings-intensities")

 
// export enum FeelingIntensity {
//     No = 0,
//     Negligible = 1,
//     VeryLow = 2,
//     Low = 3,
//     BelowModerate = 4,
//     Moderate = 5,
//     AboveModerate = 6,
//     BelowHigh = 7,
//     High = 8,
//     VeryHigh = 9,
//     ExtremelyHigh = 10
// }

export interface FeelingsScaleProps {
    feelings: FeelingsArrayType
    onRescaleDone: ( feelings: FeelingsArrayType ) => void ; 
}

export const FeelingsScale = ({feelings, onRescaleDone}: FeelingsScaleProps) => {
    const [scales, setScales] = useState(feelings);
    const [addingFeeling, setAddingFeeling] = useState(false);
    // const itemsRef = useRef(new Array());

    return(
		<Container
			bsPrefix="container d-flex flex-column justify-content-center align-items-center">
            <Card className="rbs-feelings-card">
                <Card.Header>
                    
                    { addingFeeling ?
                        <Row>
                            <Col sm={1}>
                                <FontAwesomeIcon icon={faSquareMinus}
                                    onClick={() => {setAddingFeeling(false)}}
                                />
                            </Col> 
                            <Col sm={7}>
                                <DropdownFeelingSelector onClick={
                                    (e)=>{
                                        const feeling_name = hebFeelings.find(f => f.id === Number(e.currentTarget.id))?.feeling_name
                                        if(feeling_name)
                                        {
                                            console.log(feeling_name)

                                            let new_scales = scales.concat([{
                                                emotion_name: feeling_name, 
                                                emotion_intensity: "5" as FeelingIntensityEnumType
                                            }])
                                            setScales(new_scales)
                                            setAddingFeeling(false)
                                        }
                                    }}/>
                            </Col> 
                        </Row> :
                        <Row>
                            <Col sm={1}>
                                <FontAwesomeIcon icon={faSquarePlus}
                                    onClick={() => {setAddingFeeling(true)}}
                                />
                            </Col> 
                        </Row>
                    }

                </Card.Header>
                
                {scales.length > 0 ? scales.map((f, i) => 
                    <Card.Body key={i}>
                        <Card.Subtitle>
                            <Row>
                                <Col sm={1}>
                                    <FontAwesomeIcon icon={faSquareXmark} 
                                    onClick={() => {
                                        let new_scales = scales.filter((s, s_idx)=>{return s_idx !== i})
                                        setScales(new_scales)
                                        }}/> 
                                </Col>
                                <Col sm={7}>
                                    {f.emotion_name}
                                </Col>
                            </Row>
                        </Card.Subtitle>

                        <Form className="rbs-feelings-list-form">
                                <Form.Control className={'emotion-level-'+f.emotion_intensity} type="range" key={i}  
                                    min={1} step={1} max={10} value={f.emotion_intensity} 
                                    onChange={(event) => 
                                        {
                                            let new_scales = scales.map((s)=>{
                                                return s.emotion_name === f.emotion_name ? 
                                                    {
                                                        emotion_name: s.emotion_name, 
                                                        emotion_intensity: event.target.value as FeelingIntensityEnumType
                                                    } : s})
                                            setScales(new_scales)
                                            console.log(event.target.value)
                                        }}
                                />
                        </Form>
                    </Card.Body>
                    ) : 
                    <Card.Body>
                        <Card.Subtitle> 
                            {'לא נבחרו רגשות'}
                        </Card.Subtitle>
                    </Card.Body>
                }
                <Card.Footer className="text-muted">
                    <Button variant="info" size="sm" className="bg-white text-dark border-dark rounded" 
                    onClick={() => {onRescaleDone(scales)}} >
                        {process.env.REACT_APP_RTL ==='yes' ? 'אישור': 'Ok'}
                    </Button>
                </Card.Footer>      
            </Card>
 
        </Container>

    )
};