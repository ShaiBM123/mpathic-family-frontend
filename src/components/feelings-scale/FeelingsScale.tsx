import { useState } from "react";
import { z } from 'zod';
// import { zodResponseFormat } from 'openai/helpers/zod';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSquareXmark, faSquarePlus, faSquareMinus } from '@fortawesome/free-solid-svg-icons'
import { DropdownFeelingSelector, HebFeelings } from './FeelingsDropdown'

export const FeelingIntensityEnum = z.enum(["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"]);
// const FeelingIntensityEnum = z.nativeEnum(FeelingIntensityEnum);
export type FeelingIntensityEnumType = z.infer<typeof FeelingIntensityEnum>;
export const Feeling = z.object({
    emotion: z.object({
        emotion_category: z.string(),
        emotion_name: z.string(),
    }),
    // emotion_name: z.enum([HebFeelings[0].feeling_name, ...HebFeelings.filter((_, idx) => { return idx > 0 }).map((f) => { return f.feeling_name })]),
    emotion_intensity: FeelingIntensityEnum,
});
export const FeelingsArray = z.array(Feeling)
export type FeelingsArrayType = z.infer<typeof FeelingsArray>;
// export const FeelingsResponseFormat = zodResponseFormat(z.object({feelings: FeelingsArray, description: z.string()}), "feelings-intensities")


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


interface FeelingsScaleBarProps {
    intensity: FeelingIntensityEnumType;
    onRescale: (new_intensity: FeelingIntensityEnumType) => void;
}

const FeelingsScaleBar = ({ intensity, onRescale }: FeelingsScaleBarProps) => {
    // const [value, setValue] = useState(intensity);

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        // setValue(event.target.value as FeelingIntensityEnumType);
        onRescale(event.target.value as FeelingIntensityEnumType)
    };

    const getBackgroundColor = (value: FeelingIntensityEnumType) => {
        switch (value) {
            case "1": return 'rgba(51, 51, 255, 1)'; // Medium Blue
            case "2": return 'rgba(102, 102, 255, 1)'; // Light Blue
            case "3": return 'rgba(153, 153, 255, 1)'; // Very Light Blue
            case "4": return 'rgba(255, 255, 153, 1)'; // Light Yellow
            case "5": return 'rgba(255, 255, 102, 1)'; // Yellow
            case "6": return 'rgba(255, 204, 51, 1)'; // Yellow-Orange
            case "7": return 'rgba(255, 153, 51, 1)'; // Light Orange
            case "8": return 'rgba(255, 102, 0, 1)'; // Orange
            case "9": return 'rgba(255, 51, 51, 1)'; // Light Red
            case "10": return 'rgba(204, 0, 0, 1)'; // Red
            default: return 'rgba(51, 51, 255, 1)'; // Default to Blue
        }
    };

    return (
        <div className="container feelings-scale-container">
            <div className="row justify-content-center">
                <div className="col-lg-6 col-md-8 col-12">
                    <form>
                        <div className="form-group">
                            <input min="1" step="1" max="10" type="range"
                                id="feelingsScale"
                                className="form-control-range"
                                value={intensity}
                                onChange={handleChange}
                                style={{
                                    background:
                                        getBackgroundColor(intensity)
                                }}
                            />

                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export interface FeelingsScaleProps {
    feelings: FeelingsArrayType;
    active: Boolean;
    onRescaleDone: (feelings: FeelingsArrayType, promptMsg: string) => void;
}

export const FeelingsScale = ({ feelings, active, onRescaleDone }: FeelingsScaleProps) => {
    const [scales, setScales] = useState(feelings);
    const [addingFeeling, setAddingFeeling] = useState(false);
    // const itemsRef = useRef(new Array());
    const composePromptMsg = () => {
        let msg = scales.map((s) => { return ` ${s.emotion.emotion_name} בעוצמה ${s.emotion_intensity} ` }).join(' ')
        return `אני מרגיש את הרגשות הבאים בסולם של אחת עד עשר: ${msg}`
    }

    return (

        <div className={`${active ? "enabled" : "disabled"} feelings-container container`}>

            {/* <div className="">
        </div> */}

            <div className="card">

                {active &&
                    <div className="card-header">

                        {addingFeeling ?
                            <div className="row">
                                <div className="col-md-1 col-1">
                                    <FontAwesomeIcon
                                        icon={faSquareMinus} size={'1x'}
                                        onClick={() => { setAddingFeeling(false) }} />
                                </div>
                                <div className="col-md-10 col-10">
                                    <DropdownFeelingSelector onSelect={
                                        (feeling_name) => {

                                            if (feeling_name) {
                                                console.log(feeling_name)

                                                let new_scales = scales.concat([{
                                                    emotion: {
                                                        emotion_category: '',
                                                        emotion_name: feeling_name
                                                    },
                                                    emotion_intensity: "5" as FeelingIntensityEnumType
                                                }])
                                                setScales(new_scales)
                                                setAddingFeeling(false)
                                            }
                                        }} />
                                </div>
                            </div> :
                            <div className="row">
                                <div className="col-1">
                                    <FontAwesomeIcon icon={faSquarePlus} size={'1x'}
                                        onClick={() => { setAddingFeeling(true) }}
                                    />
                                </div>
                            </div>
                        }

                    </div>
                }

                <div className="card-body">
                    {scales.length > 0 ?

                        scales.map((f, i) =>
                            <div className={"feeling-block"} key={i}>
                                <div className={"feeling-head"} >
                                    {active &&
                                        <FontAwesomeIcon icon={faSquareXmark} size={'1x'} style={{ paddingLeft: "10px" }}
                                            onClick={() => {
                                                let new_scales = scales.filter((s, s_idx) => { return s_idx !== i })
                                                setScales(new_scales)
                                            }} />
                                    }
                                    {f.emotion.emotion_name}
                                </div>
                                <div>
                                    <FeelingsScaleBar
                                        intensity={f.emotion_intensity}
                                        onRescale={
                                            (new_intensity: FeelingIntensityEnumType) => {
                                                let new_scales = scales.map((s) => {
                                                    return s.emotion.emotion_name === f.emotion.emotion_name ?
                                                        {
                                                            emotion: s.emotion,
                                                            emotion_intensity: new_intensity
                                                        } : s
                                                })
                                                setScales(new_scales)
                                            }}
                                    />
                                </div>
                            </div>
                        ) :

                        <div className="card-subtitle h6">
                            {'לא נבחרו רגשות'}
                        </div>
                    }
                </div>

                {active &&
                    <div className="d-flex justify-content-center text-muted card-footer">

                        <button type="button" className="bg-white text-dark border-dark rounded btn btn-info btn-sm"
                            onClick={() => { onRescaleDone(scales, composePromptMsg()) }}>

                            {process.env.REACT_APP_RTL === 'yes' ? 'אישור' : 'Ok'}
                        </button>
                    </div>
                }
            </div>

        </div>

    )
};