import { Link } from "react-router-dom";
import RoundBtn from "../components/legacy/RoundBtn";
import cong_icon from '../images/cong_Icon.svg';
import final_shape from '../images/final_shape.svg';

const SignupSuccess = () => {
  const userData = JSON.parse(sessionStorage.getItem("userData") as string);
  const userGender = userData?.gender;

  return (
    <>
      <div className="congs_content padding-top">
        <div className="container">
          <h4>נעים מאוד {userData.name}!</h4>
          <img
            src={cong_icon}
            className="mt-3"
            alt="Congrats"
          />
          <h5 className="mt-4">
            בהמשך תוכל
            {userGender === "male" ? " " : "י "}
            לעדכן ולשנות את מה שבחרת. <br />
            <span className="mt-4 d-block">
              בוא
              {userGender === "male" ? " " : "י "}
              נתחיל!
            </span>
          </h5>
          <Link to="/chat" className="line">
            <RoundBtn
              extraClass="mt-5 text-regular bg-secondary-button"
              text="יאללה, נתחיל"
            />
          </Link>
          <div className="footer custom_final_footer">
            <img src={final_shape} alt="Shape" />
          </div>
        </div>
      </div>
    </>
  );
};

export default SignupSuccess;
