import { useRef, forwardRef } from "react";
import { useField } from "formik";
import { range } from "../../AppUtils";
import DatePicker from "react-datepicker";
// import "react-datepicker/dist/react-datepicker.css";
import 'react-datepicker/dist/react-datepicker.min.css';

const CustomInput = forwardRef((props: any, ref) => {
    let { className, ...rest } = props;
    return <input className="form-control input_shadow custom_input" {...rest} ref={ref} />;
});

export const CustomFormikDatePicker = ({ name = "" }) => {
    const [field, meta, helpers] = useField(name);

    const { value } = meta;
    const { setValue } = helpers;
    const inputRef = useRef(null);
    const years = range(1900, (new Date()).getFullYear() + 1, 1);
    const months = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
    ];

    return (
        <DatePicker wrapperClassName="custom_datepicker_wrapper"
            {...field}
            customInput={<CustomInput inputRef={inputRef} />}
            selected={value}
            onChange={(date: Date) => setValue(date)}
            dateFormat="dd/MM/yyyy"
            maxDate={new Date()}
            renderCustomHeader={({
                date,
                changeYear,
                changeMonth,
                decreaseMonth,
                increaseMonth,
                prevMonthButtonDisabled,
                nextMonthButtonDisabled,
            }: any) => (
                <div
                    style={{
                        margin: 2,
                        width: "100%",
                        height: "40px",
                        display: "flex",
                        justifyContent: "center",
                    }}
                >
                    <button style={{ width: "15%" }} onClick={decreaseMonth} disabled={prevMonthButtonDisabled}>
                        {"<"}
                    </button>
                    <select
                        style={{ width: "30%" }}
                        value={date.getFullYear()}
                        onChange={({ target: { value } }) => changeYear(value)}
                    >
                        {years.map((option) => (
                            <option style={{ fontSize: "12px" }} key={option} value={option}>
                                {option}
                            </option>
                        ))}
                    </select>

                    <select
                        value={months[date.getMonth()]}
                        onChange={({ target: { value } }) =>
                            changeMonth(months.indexOf(value))
                        }
                    >
                        {months.map((option) => (
                            <option style={{ fontSize: "12px" }} key={option} value={option}>
                                {option}
                            </option>
                        ))}
                    </select>

                    <button style={{ width: "15%" }} onClick={increaseMonth} disabled={nextMonthButtonDisabled}>
                        {">"}
                    </button>
                </div>
            )}
        // peekNextMonth
        // showYearDropdown
        // dropdownMode="select"

        />
    );
};
