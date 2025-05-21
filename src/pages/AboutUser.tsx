import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import * as Yup from "yup";
import { Formik } from "formik";
import callApi from "../lib/apisauce/callApi";
import RadioBtn from "../components/legacy/RadioBtn";
import RoundBtn from "../components/legacy/RoundBtn";
import type { ApiResponse } from "apisauce/apisauce";
import { queryString } from "../AppUtils";
// import { CustomFormikDatePicker } from "../components/legacy/CustomDatePicker2";
// import DatePicker from 'react-date-picker';
// import 'react-date-picker/dist/DatePicker.css';
// import 'react-calendar/dist/Calendar.css';

import header_shape from '../images/header-shape.svg';

const validationSchema = Yup.object().shape({
  first_name: Yup.string()
    .required("יש להזין את שמך")
    .max(45, "שם ארוך מדי (יותר מ45 תווים)"),
  age: Yup.number()
    .typeError("יש להזין גיל במספרים בלבד")
    .integer("יש להזין מספר שלם")
    .min(5, "גיל מינימלי חייב להיות לפחות 5")
    .max(120, "גיל מקסימלי לא יכול להיות מעל 120")
    .required("יש להזין גיל"),
});

const AboutUser = () => {
  const userData = JSON.parse(sessionStorage.getItem("userData") as string);
  let savedName, gendr;
  // savedName = userData?.name !== "" ? userData?.name : "";
  gendr = userData?.member_gender !== "" ? userData?.member_gender : "";
  const [gender, setGender] = useState(gendr || "");
  const [genderErr, setGenderErr] = useState(false);
  const RegUserData = JSON.parse(sessionStorage.getItem("RegUserData") as string);
  const last_id = RegUserData?.last_id || "";

  const navigate = useNavigate();
  const updateMode = sessionStorage.getItem("updateMode");

  const initialValues = {
    first_name: userData?.first_name || "",
    age: userData?.age || "",
  };

  useEffect(() => {
    if (gender !== "") {
      setGenderErr(false);
    }
  }, [gender]);


  const handleSubmit = async (values: any) => {

    if (gender === "") {
      setGenderErr(true);
    } else {
      setGenderErr(false);
    }
    if (gender === "") return;

    const userData = JSON.parse(sessionStorage.getItem("userData") as string);

    // Calculate date_of_birth from age
    const date_of_birth = `${new Date().getFullYear() - Number(values.age)}-01-01`;
    // Exclude age from newUserData, use date_of_birth instead
    const { age, ...restValues } = values;

    let newUserData =
      last_id && last_id !== ""
        ? {
          ...userData,
          ...restValues,
          date_of_birth,
          gender,
          last_id,
        }
        : {
          ...userData,
          ...restValues,
          date_of_birth,
          gender,
        };

    let userDataNoBlanks = Object.fromEntries(
      Object.entries(newUserData).filter((value) => value[1])
    ); //Remove key with Blank value if any.

    try {
      const res = await callApi.postData(
        "member_register",
        queryString(userDataNoBlanks),
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
          },
        }
      ) as ApiResponse<any>;

      if (res?.ok) {
        if (res.data?.status === "success") {
          const { userdata } = res.data;

          const {
            email,
            username,
            google_token,
            first_name,
            gender,
            age,
          } = userdata;

          sessionStorage.setItem(
            "userData",
            JSON.stringify({
              email,
              username,
              google_token,
              first_name,
              gender,
              age,
            })
          );

          sessionStorage.setItem("UserJWT", JSON.stringify(res.data.jwt));
          sessionStorage.removeItem("RegUserData");

          navigate("/chat");

        } else {
          console.log(res.data.message);
        }
      } else {
        console.log(res.originalError);
      }
    } catch (error) {
      console.log(error);
    }
  }


  return (
    <div dir="rtl">
      <div className="bg-light_e pb-2">
        {/* Header Section Start */}
        <div className="header_register">
          <img
            src={header_shape}
            className="w-100"
            alt="header-shape"
          />

          {updateMode !== undefined && updateMode === "on" ? (
            <h5 className="img-shape_content">
              פה ניתן לעדכן את הפרטים שלך :)
              <br /> <br />
              <span className="small"> 3 שאלות ומתחילים </span>
            </h5>
          ) : (
            <h5 className="img-shape_content">
              לפני הכל, נשמח להכיר קצת
              <br /> <br />
              <span className="small"> 3 שאלות ומתחילים </span>
            </h5>
          )}
        </div>
        {/* Header Section End */}

        {/* Input Section Start */}
        <div className="register-input">
          <Formik
            initialValues={initialValues}
            onSubmit={handleSubmit}
            validationSchema={validationSchema}
          >
            {({
              handleChange,
              handleSubmit,
              errors,
              getFieldHelpers,
              setFieldTouched,
              touched,
              values,
            }) => (
              <>
                <div className="container">
                  <div className="mb-3 mt-3 w-100">
                    <label className="form-label custom-lebel-register">
                      1. איך קוראים לך?
                    </label>
                    <input
                      type="text"
                      className="form-control input_shadow custom_input"
                      name="first_name"
                      onChange={handleChange("first_name")}
                      onBlur={() => setFieldTouched("first_name")}
                      title="FirstName"
                      value={values.first_name}
                      required
                    />
                    {touched.first_name && <p className="err_msg">{errors.first_name}</p>}
                  </div>

                  <div className="mb-3 mt-3 w-100 custom_date_of_birth">
                    <label className="form-label custom-lebel-register">
                      2. מהו גילך?
                    </label>
                    <input
                      type="number"
                      className="form-control input_shadow custom_input"
                      name="age"
                      min="1"
                      max="120"
                      step="1"
                      onChange={handleChange("age")}
                      onBlur={() => setFieldTouched("age")}
                      title="Age"
                      value={values.age}
                      required
                    />
                    {touched.age && <p className="err_msg">{errors.age}</p>}
                  </div>


                  {/* Input Radio 1 */}
                  <div className="input_radio_register mt-5">
                    <label className="form-label custom-lebel-register">
                      3. איך לפנות אליך?
                    </label>
                    <RadioBtn
                      extraClass="mb-3"
                      radioId="gender1"
                      radioName="gender"
                      value="female"
                      checked={gender === "female"}
                      onChange={(e: any) => setGender(e.target.value)}
                      labelText="בלשון נקבה"
                    />
                    <RadioBtn
                      radioId="gender2"
                      radioName="gender"
                      value="male"
                      checked={gender === "male"}
                      onChange={(e: any) => setGender(e.target.value)}
                      labelText="בלשון זכר"
                    />
                    {genderErr && (
                      <p className="err_msg">יש לבחור את האפשרות המתאימה</p>
                    )}
                  </div>

                  {/* Button Design */}
                  <div className="line">
                    <RoundBtn
                      extraClass="mt-5 text-regular bg-secondary-button"
                      text="להמשיך לצ'ט"
                      onClick={handleSubmit}
                    />
                  </div>
                </div>
              </>
            )}
          </Formik>
        </div>
      </div>
      {/* Input Section End */}
    </div>
  );
};

export default AboutUser;
