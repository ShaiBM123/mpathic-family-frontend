import {useState, useRef} from "react";
import { CSSProperties } from 'react';
// import { Slider, Button, ButtonToolbar, CustomProvider, Container } from 'rsuite';
import { Container, Row } from "react-bootstrap";
import {Form, Button} from 'react-bootstrap'
// import Form from 'react-bootstrap/Form'
// import Button from 'react-bootstrap/Button'

export enum FeelingIntensity {
    No = 0,
    Negligible = 1,
    VeryLow = 2,
    Low = 3,
    BelowModerate = 4,
    Moderate = 5,
    AboveModerate = 6,
    BelowHigh = 7,
    High = 8,
    VeryHigh = 9,
    ExtremelyHigh = 10
}

const fIToC = new Map<FeelingIntensity, CSSProperties>(); 
fIToC.set(FeelingIntensity.No, { backgroundColor: 'rgb(255, 255, 255)' }, ) // White
fIToC.set(FeelingIntensity.Negligible, { backgroundColor: 'rgb(255, 255, 204)' }) // Light Yellow
fIToC.set(FeelingIntensity.VeryLow, { backgroundColor: 'rgb(255, 255, 153)' }) // Yellow
fIToC.set(FeelingIntensity.Low, { backgroundColor: 'rgb(255, 255, 102)' }) // Medium Yellow
fIToC.set(FeelingIntensity.BelowModerate, { backgroundColor: 'rgb(255, 255, 51)' }) // Bright Yellow
fIToC.set(FeelingIntensity.Moderate, { backgroundColor: 'rgb(255, 204, 0)' }) // Gold
fIToC.set(FeelingIntensity.AboveModerate, { backgroundColor: 'rgb(255, 153, 0)' }) // Orange
fIToC.set(FeelingIntensity.BelowHigh, { backgroundColor: 'rgb(255, 102, 0)' }) // Dark Orange
fIToC.set(FeelingIntensity.High, { backgroundColor: 'rgb(255, 51, 0)' }) // Orange Red
fIToC.set(FeelingIntensity.VeryHigh, { backgroundColor: 'rgb(204, 0, 0)' }) // Red Orange
fIToC.set(FeelingIntensity.ExtremelyHigh, { backgroundColor: 'rgb(255, 0, 0)' }) // Bright Red

export type FeelingIntensitiesArray = Array<{ emotion_name: string, emotion_intensity: string }>;
// export interface FeelingsScaleProps {
//     feelings: { [feeling: string]: FeelingIntensity } 
//     onRescaleDone: ( feelings: { [feeling: string]: FeelingIntensity } ) => void ; 
// }

export interface FeelingsScaleProps {
    feelings: FeelingIntensitiesArray
    onRescaleDone: ( feelings: FeelingIntensitiesArray ) => void ; 
}

export const FeelingsScale = ({feelings, onRescaleDone}: FeelingsScaleProps) => {
    const [scales, setScales] = useState(feelings);
    const itemsRef = useRef(new Array());

    return(
		<Container
            className="w-100"
			bsPrefix="container d-flex flex-column justify-content-center align-items-center"
			// style={{ minHeight: 100 + "vh" }}
            >
           
            {scales.map((f, i) => 

                <Row key={i} className="w-100">
                    <Form>
                        <Form.Group controlId="formBasicRange">
                            <Form.Label>{f.emotion_name}</Form.Label>
                            <Form.Control type="range" key={i} ref={(elm: any) => itemsRef.current.push(elm)} 
                                min={1} step={1} max={10} defaultValue={f.emotion_intensity} 
                                onChange={(event) => 
                                    {
                                        console.log(event.target.value)
                                        // setValue(event.target.value);
                                    }}
                            />
                        </Form.Group>
                    </Form>
                </Row>
                // <>
                //     <Slider key={i} ref={(elm) => itemsRef.current.push(elm)} 
                //     defaultValue={f.intensity} min={1} step={1} max={10} graduated progress /> 
                //     <br />
                // </>
            )}


            <Button variant="primary" size="lg" block onClick={() => {
                    let  new_scales = scales.map(
                        (s, i) => {return  {emotion_name: s.emotion_name, emotion_intensity: itemsRef.current[i].value} })
                    onRescaleDone(new_scales)
                    }
                } >
                {process.env.REACT_APP_RTL ==='yes' ? 'שמור ושלח': 'Ok'}
            </Button>
 
        </Container>

    )
};