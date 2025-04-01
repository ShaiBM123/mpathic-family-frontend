import { useEffect, useState } from "react";
import { Field, Formik } from "formik";
import * as Yup from "yup";
import RoundBtn from "../components/legacy/RoundBtn";
import callApi from "../lib/apisauce/callApi";
import { queryString } from "../AppUtils";
import { useNavigate } from "react-router-dom";
import { ApiResponse } from "apisauce";
// import { signupNum } from "../utils/signupNum";

const signUpSchema = Yup.object({
  username: Yup.string().required("יש להזין שם משתמש"),
  password: Yup.string()
    .required("יש להזין סיסמה")
    .min(6, "סיסמה קצרה מדי (פחות מ6 תווים)")
    .max(20, "סיסמה ארוכה מדי (יותר מ20 תווים)"),
  confirmPassword: Yup.string()
    .required("יש להזין את הסיסמה בשנית (לצורך אימות)")
    .oneOf(
      [Yup.ref("password"), null],
      "הסיסמה שהזנת לא תואמת את הסיסמה שהוזנה בשדה הקודם"
    ),
  // member_code: Yup.string().required("יש להזין את הקוד שקיבלת מהמלווה"),
  email: Yup.string().email("כתובת דוא״ל לא תקינה"),
  checkbox: Yup.boolean().oneOf([true], "יש לאשר את התקנון"),
});

const Registration = () => {
  const [showP, setShowP] = useState(false);
  const [showCP, setShowCP] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(false);
  const [errMsg, setErrMsg] = useState("");
  const [codeErr, setCodeErr] = useState(false);
  const [emailErrMsg, setEmailErrMsg] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, []);

  useEffect(() => {
    var modalToggle: any;
    setTimeout(() => {
      modalToggle = document.getElementById("btnClose");
    }, 2000);
    return () => {
      modalToggle?.click();
    };
  }, []);

  const [email, setEmail] = useState(
    JSON.parse(sessionStorage.getItem("userData") as string)?.email || ""
  );

  const initialValues = {
    username: "",
    password: "",
    confirmPassword: "",
    member_code: "",
    email: "",
    checkbox: false,
  };

  const logOut = () => {
    //incase of expired member code
    localStorage.removeItem("UserJWT");
    ["UserJWT", "userData"].forEach((key) => {
      sessionStorage.removeItem(key);
    });
    navigate("/");
  };

  const handleSubmit = (values: any) => {
    const { username, password, confirmPassword, email } = values;
    // if (member_code.length === 6 && signupNum.includes(member_code)) {
    //   setCodeErr(false);
    // } else {
    //   return setCodeErr(true);
    // }

    if (
      username !== "" &&
      password !== "" &&
      confirmPassword !== ""
      // &&
      // member_code !== ""
    ) {
      registerUser({ username, password, email });
    }
  };

  const registerUser = async ({ username, password, email }: { username: string; password: string; email: string }) => {
    const regData =
      email && email !== ""
        ? { username, password, email }
        : { username, password };
    setLoading(true);
    try {
      const res = await callApi.postData("registration", queryString(regData), {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
        },
      }) as ApiResponse<any, any>;

      if (res.ok) {
        if (res.data.status === "success") {
          sessionStorage.setItem(
            "RegUserData",
            JSON.stringify({ last_id: res.data.last_id })
          );
          const userData = { username, email };
          sessionStorage.setItem("userData", JSON.stringify(userData));
          setErr(false);
          setErrMsg("");
          setLoading(false);
          navigate("/save-cookies", {
            replace: true,
            state: {
              username,
              password,
            },
          });
        } else {
          // if (res.data.message === "תוקף הקוד פג") {
          //   console.log(res.data.message);
          //   sessionStorage.setItem("ExpireCode", "True");
          //   logOut();
          // }
          if (res.data.message === "Email must be a valid email") {
            console.log(res.data.message);
            setErr(true);
            setEmailErrMsg(res.data.message);
          }
          if (res?.data?.err_email?.length > 0) {
            setErr(true);
            setEmailErrMsg(res?.data?.err_email);
          }
          setErr(true);
          setErrMsg(res.data.message);
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
          setFieldTouched,
          errors,
          touched,
          values,
        }) => (
          <div className="a1_a_main">
            <div className="a1_a_main_details mt-5">
              <div className="container px-4">
                <div className="header-logo ">
                  <img src="assets/images/logo.svg" alt="" />
                  <p className="mt-3">הרשמה עם סיסמה</p>
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
                      onChange={(e) => {
                        handleChange(e);
                        setErr(false);
                      }}
                      onBlur={handleBlur}
                      autoComplete="new-password"
                    />
                  </div>
                  {errors.username && touched.username ? (
                    <p className="err_msg" style={{ marginTop: -15 }}>
                      {errors.username}
                    </p>
                  ) : null}
                  {err && (
                    <p className="err_msg" style={{ marginTop: -15 }}>
                      {errMsg === "Email must be a valid email" ? "" : errMsg}
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
                      onChange={handleChange}
                      onBlur={handleBlur}
                      autoComplete="new-password"
                    />
                    <div className="pass_show_hide_icon">
                      {!showP ? (
                        <img
                          src="assets/images/pass_show_Icon.svg"
                          alt=""
                          onClick={() => setShowP(!showP)}
                        />
                      ) : (
                        <img
                          src="assets/images/pass_hide_Icon.svg"
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

                  {/* Input Design */}
                  <div className="mb-3 w-100 position-relative">
                    <label className="form-label custom-form-label">
                      הכנסת סיסמה פעם שניה: *
                    </label>
                    <input
                      type={`${showCP ? "text" : "password"}`}
                      className="form-control input_shadow custom_input "
                      name="confirmPassword"
                      value={values.confirmPassword}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      autoComplete="new-password"
                    />
                    <div className="pass_show_hide_icon">
                      {!showCP ? (
                        <img
                          src="assets/images/pass_show_Icon.svg"
                          alt=""
                          onClick={() => setShowCP(!showCP)}
                        />
                      ) : (
                        <img
                          src="assets/images/pass_hide_Icon.svg"
                          alt=""
                          onClick={() => setShowCP(!showCP)}
                        />
                      )}
                    </div>
                  </div>
                  {errors.confirmPassword && touched.confirmPassword ? (
                    <p className="err_msg" style={{ marginTop: -15 }}>
                      {errors.confirmPassword}
                    </p>
                  ) : null}

                  {/* Input Design */}

                  {/* <div className="mb-4 w-100">
                    <label className="form-label custom-form-label">
                      קוד כניסה (שקיבלת מהמלווה): *
                    </label>
                    <input
                      type="text"
                      className="form-control input_shadow custom_input"
                      name="member_code"
                      onChange={handleChange("member_code")}
                      onBlur={() => setFieldTouched("member_code")}
                      autoComplete="new-password"
                    />
                    {touched.member_code && (
                      <p className="err_msg">{errors.member_code}</p>
                    )}
                    {codeErr && (
                      <p className="err_msg" style={{ marginTop: -15 }}>
                        הקוד שהזנת שגוי/לא קיים
                      </p>
                    )}
                  </div> */}

                  {/* Input Design */}
                  <label className="form-label custom-form-label">
                    כתובת דוא”ל
                  </label>
                  <input
                    type="email"
                    className="form-control input_shadow custom_input"
                    name="email"
                    //onChange={handleChange("email")}
                    onChange={(e) => {
                      handleChange(e);
                      setErr(false);
                    }}
                    onBlur={() => setFieldTouched("email")}
                    title="Email"
                    autoComplete="new-password"
                  />
                  {touched.email && <p className="err_msg">{errors.email}</p>}
                  {err && (
                    <p className="err_msg" style={{ marginTop: -15 }}>
                      {emailErrMsg.length > 0 &&
                        emailErrMsg === "Email must be a valid email"
                        ? "נא להזין כתובת אימייל חוקית"
                        : emailErrMsg}
                    </p>
                  )}

                  {/* Checkbox Design */}
                  <div className="form-check my-3 w-100 custom-chb">
                    <Field type="checkbox" id="checkbox" name="checkbox" />
                    <label
                      className="form-check-label custom-form-label"
                      htmlFor="checkbox"
                    >
                      אישור
                      <a
                        href="#"
                        data-bs-toggle="modal"
                        data-bs-target="#termsModal"
                      >
                        {" "}
                        התקנון
                      </a>{" "}
                      *
                    </label>
                    {touched.checkbox && (
                      <p className="err_msg">{errors.checkbox}</p>
                    )}
                  </div>

                  {/* Primary Button Design */}
                  <div className="position-relative">
                    <RoundBtn
                      extraClass={`text-regular mt-5 mb-3 ${values.username &&
                        values.password &&
                        values.confirmPassword
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
      {/* Modal */}
      <div
        className="modal fade"
        id="termsModal"
        data-bs-backdrop="static"
        data-bs-keyboard="false"
        tabIndex={-1}
        aria-labelledby="staticBackdropLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog ">
          <div className="modal-content">
            <div className="modal-header border-0 ">
              <button
                type="button"
                className="btn-close mt-1"
                data-bs-dismiss="modal"
                aria-label="Close"
                id="btnClose"
              />
            </div>
            <div
              className="modal-body"
              style={{
                maxHeight: "calc(100vh - 80px)",
                overflowY: "auto",
              }}
            >
              <div className="header-logo">
                <img src="assets/images/logo.svg" alt="Logo" />
                <p>תקנון</p>
              </div>
              <div className="modal_body_content">
                <p style={{ textAlign: "center" }}>
                  <b>
                    <u>"אמפתיק פאמילי" - תקנון אתר/אפליקציה</u>
                  </b>
                </p>
                <b>1. כללי </b>
                <br />
                1.1. אמפתיק פאמילי הוא אתר ואפליקציה המציעה להורים וילדיהם (וכן
                בני זוג ובודדים) פלטפורמה מקוונת אשר עשויה לסייע ליישם תקשורת
                מקרבת ולהיטיב את השיח ביניהם.
                <br /> 1.2. אמפתיק פאמילי משקיעה מאמצים לתכנון מתודולוגית איסוף
                נתונים לצורך שמירת פרטיות המשתמשים.
                <br /> 1.3. אמפתיק פאמילי (להלן : <b>"החברה"</b>), הינה הבעלים
                של אפליקציה זו. הנך מתבקש לקרוא את התנאים המפורטים באתר זה
                בקפידה, בטרם השימוש.
                <br />
                1.4. התקנון (לרבות תנאי השימוש להלן), מסדיר את היחסים בין החברה
                לבין כל משתמש שעושה שימוש בשירותים המוצעים באמצעות האפליקציה
                ו/או האתר ובמידע הקיים בהן, ובכל מקום שמצוין "אפליקציה", אזי
                אותה הוראה תחול ביחס לשניהם במשתמע (לעיל ולהלן:
                <b>"האפליקציה"</b>), לרבות גישה לאפליקציה באמצעות הטלפון, אתר
                אינטרנט, פלטפורמה מקוונת או כל אמצעי אחר.
                <br />
                1.5. השימוש באפליקציה מלמד על הסכמתך לתנאי התקנון. אם אינך מסכים
                שתנאי התקנון או תנאי כלשהו מתנאיו יחולו עליך, הנך מתבקש שלא
                להשתמש בה <br />
                <b>2. רישום, שימוש ומדיניות פרטיות.</b>
                <br />
                2.1. עם כניסתו לאפליקציה, יתבקש המשתמש להירשם לפלטפורמה במקום
                הייעודי לכך באמצעות דוא"ל/שם משתמש וסיסמה וקוד כניסה .<br />
                2.2. במסגרת השימוש באפליקציה, יזין המשתמש פרטים אישיים שונים
                הנשמרים במאגרי המידע של החברה, לרבות: שם, מצב משפחתי, מין, מס'
                ילדים וזיהויים, דוא"ל, בקשות שנוסחו בסיוע האפליקציה הכוללות טקסט
                חופשי, בחירה של רגשות וצרכים, ועוד. ייתכן שישמרו נתוני גישה כגון
                כתובות IP של המשתמש והפקת נתונים שונים ע"י החברה . <br />
                2.3. הנתונים יישמרו במאגרי המידע שבבעלות החברה אך ורק למשך הזמן
                הנדרש והסביר למטרות שלשמן הם נאספו, לפי שיקול דעתה הבלעדי של
                החברה, או עד שתקבל בקשה מפורשת למחיקתם, ובכל מקרה - כנדרש לפי
                דין. בשימושו באפליקציה, מאשר המשתמש כי ידוע לו שאין חובה על-פי
                חוק למסור את הנתונים הנ"ל, ומסירתם תלויה ברצונו והסכמתו, וכפופה
                למדיניות הפרטיות של האפליקציה.
                <br />
                2.4. האיסוף והשימוש בפרטים האישיים כפופה למדיניות הפרטיות להלן
                (להלן: <b>"מדיניות הפרטיות"</b>): <br />
                2.4.1. מדיניות הפרטיות חלה על כלל הנתונים שנמסרו במסגרת הליך
                הרישום וכן על כלל הנתונים שנאספו ושיאספו במאגרי המידע של החברה
                כדלקמן (להלן:
                <b>"המידע"</b>). <br />
                2.4.2. השארת פרטים ו/או עשיית שימוש באפליקציה, כוללת, בין היתר,
                קבלת תוכן שיווקי, פרסומים ועדכונים. החברה רשאית לעשות שימוש
                במידע על המשתמש ליצירת קשר עימו, לרבות לשם משלוח בדוא”ל, בהודעת
                טקסט לטלפון הנייד או בכל אופן אחר, מידע פרסומי למשתמשים, בין
                שמדובר במידע שהיא עצמה תפרסם ובין שמדובר במידע שתקבל מגוף צד ג'
                המשתף עימה פעולה בתחום השירותים המנוי באפליקציה.
                <br />
                2.4.3. המשתמש מסכים ומאשר, בעצם אישור מסמך זה, כי החברה תהא
                רשאית לשמור במאגריה את הפרטים שנמסרו על-ידו ומידע נוסף שיצטבר
                אודותיו, לשם ביצוע, מעת לעת, פעולות, כגון: יצירת קשר עמו, פרסום,
                מתן שירותי דיוור, על ידי החברה או מי מטעמה או גורמים אחרים,
                איסוף מידע אודותיו ושימוש בו, לרבות אחסונו, העברתו ושיתופו, על
                ידי החברה או מי מטעמה. <br />
                2.4.4 . עצם השימוש באפליקציה מהווה הסכמה למדיניות הפרטיות של
                החברה.
                <br />
                <b> 3. קניין רוחני</b>
                <br /> 3.1. כל זכויות היוצרים והקניין הרוחני של האפליקציה לרבות
                השם, העיצוב, תכנים, זכויות בבסיסי נתונים, סימני מסחר, סמלילים,
                קבצי גרפיקה, עיצובים, סודות מסחריים וזכויות אחרות המצויות
                באפליקציה וכן קוד התוכנה, מאגרי המידע, תוכנות, שמע, וידאו, טקסט,
                תמונות, וכיו"ב הן בבעלות החברה ו/או מורשיה או בבעלות צד שלישי
                שהרשה או נתן רשיון לחברה לעשות שימוש באותם תכנים או סימנים.{" "}
                <br />
                3.2. אין להעתיק, לשנות, להתאים, לפרסם, לשדר, להפיץ, למכור או
                להעביר חומר כלשהו מהאפליקציה או את קוד התוכנה, בחלקו או בשלמותו,
                ללא אישור מראש ובכתב מהחברה.
                <br />
                3.3. אין להכניס שינויים, להעתיק, לפרסם, להפיץ, לשדר, להציג,
                לבצע, לשכפל, להנפיק רישיון, ליצור עבודות נגזרות, של כל חלק מן
                המידע והתכנים הכלולים באפליקציה ללא הסכמה מראש ובכתב של החברה.
                כמו כן, אין לעשות שימוש באפליקציה באופן המהווה או שעלול להוות
                הפרה או פגיעה בקניינה הרוחני של החברה, ללא הסכמתה המפורשת לכך
                בכתב ומראש.
                <br />
                <b>4. הגבלת שימוש</b>
                <br />
                4.1. חל איסור לעשות שימוש באפליקציה בנוגע לכל אחד מהעניינים
                הבאים:
                <br />
                4.1.1. שימוש שיש בו כדי להפר זכות יוצרים או כל זכות מוגנת אחרת
                של החברה או של כל צד ג'.
                <br />
                4.1.2. שימוש הנוגד הוראת דין, חוק או צו שיפוטי תקף.
                <br />
                4.1.3. לשנות או להשחית בצורה כלשהי את פני האפליקציה ו/או קוד
                התוכנה.
                <br />
                4.1.4. שימוש באפליקציה בדרך בלתי חוקית, לרבות לצורך הפצה, שיווק
                או פרסום.
                <br />
                4.1.5. להפריע לשימושם של אחרים או של החברה באפליקציה.
                <br />
                4.1.6. להתערב באופן אלקטרוני או ידני או בכל דרך אחרת בתכני
                האפליקציה.
                <br />
                4.1.7. להציב קישורים לאפליקציה בלא קבלת רשות מראש ובכתב מהחברה.
                <br />
                4.2. השימוש באפליקציה מותר בכל גיל. פעולה ו/או רישום לאפליקציה
                של קטין או חסוי מחייבת אישור הורה או אפוטרופוס.
                <br />
                4.3. בעת שימוש באפליקציה, המשתמש מתחייב ומצהיר כדלקמן: (1)
                השימוש באפליקציה הוא באחריותו הבלעדית ובשום דרך החברה אינה
                מתחייבת לאיכות או מהימנות האפליקציה; (2) המשתמש הינו בעל כשירות
                משפטית ומסכים לתנאי התקנון; (3) המשתמש הינו מעל גיל 18 או בעל
                אישור הורה או אפוטרופוס לשימוש כנדרש; (4) המשתמש מתחייב לא לעשות
                שימוש באפליקציה באמצעים אוטומטיים, בין אם באמצעות BOT, סקריפט או
                בכל דרך אחרת; (5) המשתמש לא יעשה באפליקציה שימוש בלתי חוקי ו/או
                בלתי מורשה וכן לא יפר כל חוק, תקנה או רגולציה רלוונטיים.
                <br />
                <b>5. הגבלת אחריות</b>
                <br />
                5.1. בטרם השימוש באפליקציה, המשתמש מצהיר, מאשר ומסכים כי ידוע לו
                כי השימוש באפליקציה כפוף לתנאי תקנון זה. בשום נסיבות ו/או מקרה
                האפליקציה/החברה ו/או מי מטעמה יהיו אחראים כלפי המשתמש ו/או כלפי
                צד שלישי, לכל נזק, ישיר ו/או עקיף לרבות כל הפסד או נזק אחר שיגרם
                כתוצאה משימוש באפליקציה. כמו כן, האפליקציה לא תהא אחראית ו/או
                תישא באחריות לכל טעות, שגיאה ו/או אי דיוק של תוכן כלשהו או נזק
                או פגיעה בכל אופן שהוא שיגרמו כתוצאה משימוש באפליקציה.
                <br />
                5.2. המידע המוצג באפליקציה אינו מובא כתחליף לייעוץ מקצועי ו/או
                רפואי ו/או פסיכולוגי, ואין לראות בו תחליף לייעוץ אנשי מקצוע
                בתחום הרפואה ו/או בריאות הנפש.
                <br />
                5.3. התכנים באפליקציה ניתנים לשימוש כפי שהם מפורסמים ומופיעים
                באפליקציה (AS IS). לא ניתן לשנותם או להתאימם לצרכיו האישיים של
                המשתמש.
                <br />
                5.4. החברה לא תהיה אחראית לכל נזק ישיר, עקיף, או תוצאתי מכל מין
                וסוג שהוא, כתוצאה מהגישה לאפליקציה ו/או השימוש בה ו/או הסתמכות
                על מידע המופיע באפליקציה.
                <br />
                5.5. החברה רשאית לשנות מעת לעת את מבנה האתר ו/או האפליקציה,
                ותהיה רשאית לשנות כל היבט אחר הכרוך בו – והכל, בלי שתידרש להודיע
                על כך מראש ומבלי שלמשתמש תעמוד כל טענה כלפי החברה.
                <br />
                5.6. החברה שומרת על זכותה, למנוע או להגביל את שימוש המשתמש
                באפליקציה, בין היתר, עקב הפרת אחד או יותר מתנאי השימוש הנ"ל,
                מבלי צורך במתן הודעה מראש, מבלי שתחול על החברה כל אחריות כלפי
                המשתמש ומבלי שתעמוד למשתמש כל טענה כלפי החברה.
                <br />
                5.7. אבטחת מידע:
                <br />
                5.7.1. החברה אינה מתחייבת ששירותי האפליקציה לא יופרעו, יינתנו
                כסדרם או בלא הפסקות ויהיו חסינים לחלוטין מפני גישה בלתי-מורשית
                למחשבי החברה או מפני נזקים, תקלות או כשלים. החברה תפעל בכל
                האמצעים העומדים לרשותה כדי שמקרים מעין אלה לא יתרחשו.
                <br />
                5.7.2. החברה ומי מטעמה נוקטים צעדים סבירים על מנת לסייע בהגנה על
                אבטחת הנתונים האישיים של המשתמשים בהתאם למדיניות הפרטיות ולחוקים
                והתקנות החלים במדינת ישראל. החברה לא מתחייבת שהשירותים הניתנים
                באפליקציה יהיו חסינים באופן מוחלט מפני גישה בלתי מורשית למידע
                הנאסף בה, בעקבות פריצה עוינת מצד גורמים זרים ו/או פגם במערכות
                האפליקציה. למשתמש לא תהיה כל טענה ו/או דרישה ו/או תביעה כלפי
                החברה ו/או מי מטעמה בגין גישה בלתי מורשית למידע שנאסף עליו בשל
                שימוש באפליקציה.
                <br />
                <b>6. שיפוי</b>
                <br />
                6.1. המשתמש מתחייב לשפות את החברה ו/או מי מטעמה בגין כל נזק,
                הפסד, אבדן-רווח, תשלום או הוצאה שייגרמו להם עקב הפרת התקנון או
                תנאי כלשהו מתנאיו.
                <br />
                6.2. המשתמש מתחייב לשפות את החברה ו/או מי מטעמה בגין כל טענה,
                תביעה ו/או דרישה שתועלה נגדם ע"י צד שלישי כלשהו כתוצאה מקישורים
                שביצע שלא כדין לאפליקציה ותוך הפרת הוראות התקנון.
                <br />
                <b>7. תחום וסמכות שיפוט</b>
                <br />
                7.1. על תקנון זה והשימוש באתר יחולו אך ורק דיני מדינת ישראל.
                מקום השיפוט הבלעדי בגין כל דבר ועניין הנובע מהאמור בתקנון ו/או
                מהשימוש באפליקציה, הוא בבית המשפט המוסמך בתל אביב בלבד.
                <br />
                <b>8. שונות</b>
                <br />
                8.1. תנאי השימוש המפורטים לעיל אינם יוצרים ולא יפורשו כיוצרים כל
                שותפות, מיזם משותף, יחסי עובד מעביד, סוכן או שלוח בין המשתמש
                לבין החברה.
                <br />
                8.2. החברה שומרת לעצמה את הזכות לעדכן ו/או לשנות את תנאי השימוש
                מעת לעת על פי צרכיה ובהתאם לשיקול דעתה מבלי שתימסר על כך הודעה
                מראש.
                <br />
                8.3. שינוי תנאי התקנון, ככל שאכן ישתנו, יחולו באופן אוטומטי על
                המשתמשים העושים שימוש באפליקציה. באחריות המשתמש לבדוק מפעם לפעם
                את התקנון על מנת להישאר מעודכן בשינויים, כאשר המשך השימוש
                באפליקציה יהיה כפוף להסכמה לשינויים שיעשו בתקנון מעת לעת.
                <br />
                8.4. החברה רשאית להתיר או לאסור את גישת המשתמש לאפליקציה בכל זמן
                על פי שיקול דעתה הבלעדי.
                <br />
                8.5. החברה רשאית להפסיק את הפעילות המתבצעת באפליקציה, כולה או
                חלקה, באופן זמני ו/או קבוע, בכל עת, ומבלי שתהיה למשתמש כל טענה,
                זכות ו/או תביעה בקשר לכך.
                <br />
                8.6. תנאי השימוש המפורטים לעיל מהווים את ההסכם המלא בין המשתמש
                לחברה בכל הנוגע לאופן השימוש באתר ומחליפים כל הבנה ו/או הסכמה
                אחרת, בעל-פה או בכתב, הנוגעת לשימוש באתר ובתוכנו.
                <br />
                8.7. בתקנון זה ובכל פרסום הנוגע לפעילות באפליקציה יכול וייעשה
                לצורכי נוחות שימוש בלשון זכר אך הינו כולל פנייה בלשון זכר ונקבה
                כאחד או רבים לפי העניין.
                <br />
                <b>9. יצירת קשר</b>
                <br />
                9.1. בכל עניין, שאלה ו/או בקשה, אנא פנו אל שירות הלקוחות של
                החברה באמצעות השארת פנייה באתר החברה ו/או באפליקציה.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Registration;
