import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useGoogleLogin } from "@react-oauth/google";
import callApi from "../lib/apisauce/callApi";
import { queryString } from "../AppUtils";
// import ShortcutModal from "../components/feeling/ShortcutModal";
import { trackPromise } from "react-promise-tracker";
// import CodeExpireModal from "../components/legacy/feeling/CodeExpireModal";
import logo from '../images/logo.svg';
import google_logo from '../images/google-logo-2.svg';
import account_shape from '../images/account-shape-2.svg';
import lock from '../images/lock.svg';
import user_icon from '../images/userIcon.svg';

const SignUp = () => {
  const navigate = useNavigate();
  useEffect(() => {
    if (sessionStorage.getItem("UserJWT") !== null) navigate("/home");
  }, [navigate]);

  // const [popupShown, setPopupShown] = useState(false);
  // const location = useLocation();

  // useEffect(() => {
  //   let popupId;
  //   if (
  //     sessionStorage.getItem("ExpireCode") === "True" &&
  //     location.pathname === "/" &&
  //     !popupShown
  //   ) {
  //     setTimeout(() => {
  //       popupId = document.getElementById("code_expire_modal_btn");
  //       popupId?.click();
  //     }, 600);
  //   }
  // }, [location.pathname, popupShown]);

  //G_login fn on sucsess provide Google access_token, which is further used with Google API to get user info.

  const G_login = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      await callApi
        .getData(
          `https://www.googleapis.com/oauth2/v3/userinfo?access_token=${tokenResponse?.access_token}`
        )
        .then((res: any) => {
          if (res.ok) {
            const { email, sub } = res.data;
            const userData = { email, google_token: sub };

            trackPromise(
              callApi
                .postData("is_user_register", queryString({ email: email }), {
                  headers: {
                    "Content-Type":
                      "application/x-www-form-urlencoded; charset=UTF-8",
                  },
                })
                .then((res2: any) => {
                  if (res2.ok) {
                    if (res2.data.status === "error") {
                      //user not registered before, save data to session storage, and redirect to complete signup process.
                      sessionStorage.setItem(
                        "userData",
                        JSON.stringify(userData)
                      );
                      navigate("/enter-code");
                    } else {
                      //user email is already present (registered user), save token, some userdata to sessionStorage and redirect to homepage.
                      sessionStorage.setItem(
                        "UserJWT",
                        JSON.stringify(res2.data.jwt)
                      );
                      const { data } = res2.data;
                      const {
                        name,
                        email,
                        username,
                        google_token,
                        member_code,
                        family_role,
                        kids_exist,
                        member_gender,
                        sibling,
                        kids_over_seven,
                        parent_relationship,
                        adult_relationship,
                      } = data;

                      sessionStorage.setItem(
                        "userData",
                        JSON.stringify({
                          name,
                          email,
                          username,
                          google_token,
                          member_code,
                          family_role,
                          kids_exist,
                          member_gender,
                          sibling,
                          kids_over_seven,
                          parent_relationship,
                          adult_relationship,
                        })
                      );
                      navigate("/home", { replace: true });
                    }
                  } else {
                    console.log(res2.originalError);
                  }
                })
                .catch((res2) => {
                  console.log(res2.originalError);
                })
            );
          } else {
            console.log(res.originalError);
          }
        })
        .catch((res) => {
          console.log(res.originalError);
        });
    },
    onError: (errorResponse) => {
      console.log({ errorResponse });
    },
  });

  return (
    <div dir="rtl">
      <div className="google_account_main">
        <div className="container">
          <div className="header-logo mt-4">
            <img src={logo} alt="" />
            <p>פשוט לדבר במשפחה</p>
            <h6>
              שימוש באפליקציה זו מתאים ליחידים, זוגות ומשפחות אשר ברצונם לשפר את
              התקשורת בחייהם, ללמוד וליישם תקשורת מיטיבה עם האנשים הקרובים להם.
            </h6>
          </div>
        </div>
        <div className="account_body">
          <div className="account_ads_img px-3">
            <img
              src={account_shape}
              alt=""
              className="family_image"
            />
          </div>
          <div className="account_ads_text mt-2 px-5">
            <h6>כדי להיעזר בתכני האפליקציה, יש לעבור תהליך קצר של הרשמה.</h6>
          </div>
          <div className="btn_group_account mt-3 px-5">
            <button className="btn google-signup-btn_account" onClick={G_login as any}>
              <p className="text-regular">כניסה/הרשמה עם Google</p>
              <img
                src={google_logo}
                alt="Google Logo"
                style={{ height: 29, width: 28 }}
              />
            </button>
            <div className="link_buttons">
              <Link to="/registration">
                <button className="btn google-signup-btn_account password_lock mt-4"
                  style={{
                    height: "50px",
                    textAlign: "center",
                    margin: "0 auto",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "8px 12px",
                    gap: "5px"

                  }}>
                  <p className="text-regular">הרשמה עם סיסמה</p>
                  <img
                    src={lock}
                    alt="lock Logo"
                    style={{ height: 27, width: 27 }}
                  />
                </button>
              </Link>
              <Link to="/login">
                <button
                  className="btn google-signup-btn_account password_lock mt-4"
                  style={{
                    height: "50px",
                    textAlign: "center",
                    margin: "0 auto",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "8px 12px",
                    gap: "5px"
                  }}
                >
                  <p className="text-regular">כניסה</p>
                  <img
                    src={user_icon}
                    alt="lock Logo"
                    style={{ height: 27, width: 27 }}
                  />
                </button>
              </Link>
            </div>
          </div>
        </div>
        <div className="account_ads_footer">
          <div className="container">
            {/* <p>
              © כל הזכוייות שמורות ל-{" "}
              <a href="https://www.mpathicfamily.com/">Mpathic family</a>
            </p> */}
          </div>
        </div>
        {/* hidden btn for popup for code expire notification */}
        {/* <a
          className="line"
          data-bs-toggle="modal"
          data-bs-target="#code_expire_modal"
          id="code_expire_modal_btn"
        ></a>
        <CodeExpireModal setPopupShown={setPopupShown} /> */}
        {/* hidden btn for popup for code expire notification  */}
      </div>
    </div>
  );
};

export default SignUp;
