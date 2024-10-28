import {useState, useRef} from "react";
import { CSSProperties } from 'react';
// import { Slider, Button, ButtonToolbar, CustomProvider, Container } from 'rsuite';
import { Container, Row, Form, Button } from "react-bootstrap";
import { z } from 'zod';
import { zodResponseFormat } from 'openai/helpers/zod';
import './feelings.scale.css'

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

const fIToC = new Map<FeelingIntensityEnumType, CSSProperties>(); 
// fIToC.set(FeelingIntensity.No, { backgroundColor: 'rgb(255, 255, 255)' }, ) // White
fIToC.set("1", { backgroundColor: 'rgb(255, 255, 204)' }) // Light Yellow
fIToC.set("2", { backgroundColor: 'rgb(255, 255, 153)' }) // Yellow
fIToC.set("3", { backgroundColor: 'rgb(255, 255, 102)' }) // Medium Yellow
fIToC.set("4", { backgroundColor: 'rgb(255, 255, 51)' }) // Bright Yellow
fIToC.set("5", { backgroundColor: 'rgb(255, 204, 0)' }) // Gold
fIToC.set("6", { backgroundColor: 'rgb(255, 153, 0)' }) // Orange
fIToC.set("7", { backgroundColor: 'rgb(255, 102, 0)' }) // Dark Orange
fIToC.set("8", { backgroundColor: 'rgb(255, 51, 0)' }) // Orange Red
fIToC.set("9", { backgroundColor: 'rgb(204, 0, 0)' }) // Red Orange
fIToC.set("10", { backgroundColor: 'rgb(255, 0, 0)' }) // Bright Red

export interface FeelingsScaleProps {
    feelings: FeelingsArrayType
    onRescaleDone: ( feelings: FeelingsArrayType ) => void ; 
}

export const FeelingsScale = ({feelings, onRescaleDone}: FeelingsScaleProps) => {
    const [scales, setScales] = useState(feelings);
    const itemsRef = useRef(new Array());

    return(
		<Container className="rbs-feelings-list-container"
			bsPrefix="container d-flex flex-column justify-content-center align-items-center flex-grow-1">
           
            {scales.map((f, i) => 

                <Row key={i} className="m-0">
                    <Form className="rbs-feelings-list-form">
                        <Form.Group controlId="formBasicRange">
                            <Form.Label>{f.emotion_name}</Form.Label>
                            <Form.Control className={'emotion-level-'+f.emotion_intensity} type="range" key={i} ref={(elm: any) => itemsRef.current.push(elm)} 
                                min={1} step={1} max={10} defaultValue={f.emotion_intensity} 
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
                        </Form.Group>
                    </Form>
                </Row>
            )}

            <br />
            <Button variant="info" size="sm" className="bg-white text-dark border-dark rounded" 
                block onClick={() => {onRescaleDone(scales)}} >
                {process.env.REACT_APP_RTL ==='yes' ? 'שמור ושלח': 'Ok'}
            </Button>
 
        </Container>

    )
};