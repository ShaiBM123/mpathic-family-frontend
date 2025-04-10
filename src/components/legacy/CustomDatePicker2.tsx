import { useField } from "formik";
import { range } from "../../AppUtils";

import DatePicker from 'react-date-picker';
import 'react-date-picker/dist/DatePicker.css';
import 'react-calendar/dist/Calendar.css';

// type DateOrNull = Date | null;
// type Value = DateOrNull | [DateOrNull, DateOrNull];

export const CustomFormikDatePicker = ({ name = "" }) => {
    const [field, meta, helpers] = useField(name);
    const { value } = meta;
    const { setValue } = helpers;

    return (
        <DatePicker
            {...field}
            value={value}
            onChange={
                (date) => {
                    setValue(date)
                }
            }
            // calendarIcon={null}
            clearIcon={null}
            format="y/M/d"
            maxDate={new Date()}
        // required={true}
        />
    );
};
