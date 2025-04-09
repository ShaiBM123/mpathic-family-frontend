import { useLocation, useNavigate } from "react-router-dom";
import { useCookies } from "react-cookie";
import RoundBtn from "../components/legacy/RoundBtn";
import CryptoJS from "crypto-js";
import { salt } from "../AppUtils";

const SaveCookies = () => {
  const [cookies, setCookie, removeCookie] = useCookies<any>(["user"]);
  const { state } = useLocation();
  const { username, password } = state;
  const navigate = useNavigate();
  let encUser = CryptoJS.AES.encrypt(username, salt).toString();
  let encPass = CryptoJS.AES.encrypt(password, salt).toString();

  // let bytes  = CryptoJS.AES.decrypt(encPass, salt);
  // let originalText = bytes.toString(CryptoJS.enc.Utf8);

  const handleCookies = (saveCookii: boolean) => {
    if (saveCookii) {
      removeCookie("mpathico");
      removeCookie("mpathict");
      setCookie("mpathico", encUser, { path: "/" });
      setCookie("mpathict", encPass, { path: "/" });
    }

    navigate("/about-user", { replace: true });
  };

  return (
    <div className="a1_b_main">
      <div className="a1_b_main_details mt-5">
        <div className="container px-4">
          <div className="header-logo ">
            <img src="assets/images/logo.svg" alt="" />
            <p className="mt-3">הרשמה עם סיסמה</p>
          </div>
          <div className="a0_disc mt-5">
            <p>
              רוצה להישאר מחובר.ת
              <br />
              גם לפעמים הבאות?
            </p>
          </div>
          {/* Primary Button Design */}
          <div className="line">
            <RoundBtn
              extraClass={`text-regular mt-5 bg-primary-button`}
              text="כן"
              onClick={() => handleCookies(true)}
            />
          </div>
          {/* Secondary Button Design */}
          <div className="line">
            <button
              onClick={() => handleCookies(false)}
              className="btn bg-secondary-button_outline custom_button text-regular mt-3"
            >
              לא
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SaveCookies;
