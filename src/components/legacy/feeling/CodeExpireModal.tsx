type SetPopupShown = (shown: boolean) => void;

// Example usage in a component
interface CodeExpireModalProps {
  setPopupShown: SetPopupShown;
  // other props...
}

const CodeExpireModal: React.FC<CodeExpireModalProps> = ({ setPopupShown }) => {
  return (
    <>
      <div
        className="modal fade"
        id="code_expire_modal"
        tabIndex={-1}
        aria-labelledby="exampleModalLabel2"
        aria-hidden="true"
        data-bs-backdrop="static" //Set true = close model on clicking outside. static = when don't want to close modal on clicking outside.
        data-bs-keyboard="false" //set false when don't want to close model by ESC key on keyboard
      >
        <div className="modal-dialog modal-dialog-centered d-flex justify-content-center">
          <div className="modal-content-yt" style={{ width: "80%" }}>
            <div className="modal-header border-0">
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
                onClick={() => {
                  setPopupShown(true);
                  sessionStorage.removeItem("ExpireCode");
                }}
              />
            </div>
            <div className="modal-body">
              {/* popup design */}
              <div className="disc_a14_modal mt-1 mb-3">
                <p className="modal-title text-center a_modal_title">
                  הקוד שסיפקת בעת ההרשמה (יצירת משתמש) היה קוד זמני שפג תוקפו.
                  לקבלת קוד מעודכן יש לפנות ל- mpathic.nvc@gmail.com
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CodeExpireModal;
