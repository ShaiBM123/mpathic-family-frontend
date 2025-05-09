import { useEffect, useState } from "react";
import { Formik } from "formik";
import * as Yup from "yup";
import RoundBtn from "../components/legacy/RoundBtn";
import callApi from "../lib/apisauce/callApi";
import type { ApiResponse } from "apisauce/apisauce";
import { queryString, salt } from "../AppUtils";
import { useNavigate } from "react-router-dom";
import { useCookies } from "react-cookie";
import CryptoJS from "crypto-js";

import logo from '../images/logo.svg';
import pass_show_icon from '../images/pass_show_Icon.svg';
import pass_hide_icon from '../images/pass_hide_Icon.svg';

const signUpSchema = Yup.object({
  username: Yup.string().required("יש להזין שם משתמש"),
  password: Yup.string().required("יש להזין סיסמה"),
});

const Login = () => {
  const navigate = useNavigate();

  useEffect(() => {

    if (
      sessionStorage.getItem("UserJWT") !== null &&
      sessionStorage.getItem("userData") !== null
    ) {
      const { first_name } = JSON.parse(sessionStorage.getItem("userData") as string);

      if (!first_name) {
        navigate("/about-user", { replace: true });
      } else {
        navigate("/chat", { replace: true });
      }

    }
  }, [navigate]);

  const [cookies, setCookie] =
    useCookies<string, { mpathico: string, mpathict: string }>(["user"]);
  const [showP, setShowP] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(false);
  const [errMsg, setErrMsg] = useState("");

  let origUsername, origPass;
  if (
    cookies?.mpathico !== undefined &&
    cookies?.mpathict !== undefined &&
    cookies?.mpathico !== "" &&
    cookies?.mpathict !== ""
  ) {
    let cookieUsername = CryptoJS?.AES?.decrypt(cookies?.mpathico, salt);
    let cookiePass = CryptoJS?.AES?.decrypt(cookies?.mpathict, salt);
    origUsername = cookieUsername?.toString(CryptoJS?.enc?.Utf8);
    origPass = cookiePass?.toString(CryptoJS?.enc?.Utf8);
  }

  const initialValues = {
    username: origUsername || "",
    password: origPass || "",
  };

  // const logOut = () => {
  //   //incase of expired member code
  //   localStorage.removeItem("UserJWT");
  //   [
  //     "UserJWT",
  //     "userData",
  //     "RegUserData",
  //   ].forEach((key) => {
  //     sessionStorage.removeItem(key);
  //   });
  //   navigate("/");
  // };

  const handleSubmit = (values: { username: string, password: string }) => {
    const { username, password } = values;
    loginUser({ username: username, password });
  };

  const loginUser = async (Data: { [key: string]: any }) => {
    setLoading(true);
    try {
      const res = await callApi.postData("login-user", queryString(Data), {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
        },
      }) as ApiResponse<{
        status: string,
        jwt: string,
        message: string,
        userdata: { [key: string]: any }
      }>;

      if (res.ok) {
        if (res.data?.status === "success") {
          setErr(false);
          setErrMsg("");
          const {
            email,
            username,
            google_token,
            first_name,
            gender,
            age,
          } = res.data.userdata;

          if ((email !== "" || username !== "")) {
            sessionStorage.setItem("UserJWT", JSON.stringify(res.data.jwt));

            //if complementary user info is missing redirect to about user
            if ((!first_name || !gender || !age)) {

              sessionStorage.setItem(
                "userData",
                JSON.stringify({
                  email,
                  username,
                  google_token
                })
              );
              setLoading(false);
              navigate("/about-user", { replace: true });

            } else {

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
              setLoading(false);
              navigate("/chat", { replace: true });

            }
          } else {
            navigate("/", { replace: true });
          }
        } else {

          setErr(true);
          setErrMsg(
            res.data?.message === "Username or password is wrong"
              ? "שם משתמש /סיסמה שגויים. אנא נסו שנית"
              : res.data?.message as string
          );
        }
      } else {
        res.originalError && console.log(res.originalError);
      }
    } catch (error) {
      error && console.log(error);
    }
    setLoading(false);
  };

  return (
    <div dir="rtl">
      <Formik
        initialValues={initialValues}
        validationSchema={signUpSchema}
        onSubmit={handleSubmit}
      >
        {({
          handleChange,
          handleSubmit,
          handleBlur,
          errors,
          touched,
          values,
        }) => (
          <div className="a1_a_main">
            <div className="a1_a_main_details mt-5">
              <div className="container px-4">
                <div className="header-logo ">
                  <img src={logo} alt="" />
                  <p className="mt-3"> כניסה עם סיסמה </p>
                </div>
                <div className="password_input_main mt-4">
                  {/* Input Design */}
                  <div className="mb-3 w-100">
                    <label className="form-label custom-form-label">
                      שם משתמש: *
                    </label>
                    <input
                      type="text"
                      className="form-control input_shadow custom_input "
                      name="username"
                      value={values.username}
                      // onChange={handleChange}
                      onChange={(value) => {
                        handleChange("username")(value);
                        setErr(false);
                      }}
                      onBlur={handleBlur}
                    />
                  </div>
                  {errors.username && touched.username ? (
                    <p className="err_msg" style={{ marginTop: -15 }}>
                      {errors.username}
                    </p>
                  ) : null}
                  {err && (
                    <p className="err_msg" style={{ marginTop: -15 }}>
                      {errMsg}
                    </p>
                  )}

                  {/* Input Design */}
                  <div className="mb-3 w-100 position-relative">
                    <label className="form-label custom-form-label">
                      סיסמה: *
                    </label>
                    <input
                      type={`${showP ? "text" : "password"}`}
                      className="form-control input_shadow custom_input "
                      name="password"
                      value={values.password}
                      // onChange={handleChange}
                      onChange={(value) => {
                        handleChange("password")(value);
                        setErr(false);
                      }}
                      onBlur={handleBlur}
                    />
                    <div className="pass_show_hide_icon">
                      {!showP ? (
                        <img
                          src={pass_show_icon}
                          alt=""
                          onClick={() => setShowP(!showP)}
                        />
                      ) : (
                        <img
                          src={pass_hide_icon}
                          alt=""
                          onClick={() => setShowP(!showP)}
                        />
                      )}
                    </div>
                  </div>
                  {errors.password && touched.password ? (
                    <p className="err_msg" style={{ marginTop: -15 }}>
                      {errors.password}
                    </p>
                  ) : null}

                  {/* Primary Button Design */}
                  <div className="position-relative">
                    <RoundBtn
                      extraClass={`text-regular mt-5 ${values.username && values.password
                        ? "bg-primary-button"
                        : "primary-disable"
                        } `}
                      text="להמשיך"
                      onClick={handleSubmit}
                      loading={loading}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </Formik>
    </div>
  );
};

export default Login;
