import React, { useState } from 'react';

export interface TermsAndConditionsProps {
    onAccept: (accepted: boolean) => void;
}

export const TermsAndConditions: React.FC<TermsAndConditionsProps> = ({ onAccept }) => {
    const [isChecked, setIsChecked] = useState(false);

    const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setIsChecked(event.target.checked);
    };

    const handleAccept = () => {
        if (isChecked) {
            onAccept(true);
        } else {
            onAccept(false);
        }
    };

    return (
        <div className="terms-container">
            <h4>תקנון האתר</h4>
            <div className="terms-content">
                <p>
                    ברוכים הבאים לאמפתיק - פלטפורמה שמטרתה לסייע בפתרון קונפליקטים בין אישיים על בסיס מודל תקשורת מקרבת. אנא קראו בעיון את תנאי השימוש הבאים. השימוש באתר מהווה הסכמתכם לכל התנאים המפורטים להלן.
                </p>
                <p>
                    <strong>1. קבלת התנאים</strong><br />
                    בשימוש באתר זה, אתם מסכימים לעמוד בתנאים האלה. אם אינכם מסכימים לכל התנאים, אנא הימנעו משימוש באתר.
                </p>
                <p>
                    <strong>2. מטרת האתר</strong><br />
                    אמפתיק נועד להציע מידע והמלצות לפתרון קונפליקטים בין אישיים, אך אינו מחליף ייעוץ מקצועי.
                </p>
                <p>
                    <strong>3. הגבלת אחריות</strong><br />
                    אנו, מנהלי האתר והצוות, לא נהיה אחראים לכל נזק (ישיר או עקיף) הנובע משימוש באתר זה. כל המלצה ניתנת לפי דעת המשתמשים ואין התחייבות שהפתרונות יהיו אפקטיביים.
                </p>
                <p>
                    <strong>4. פרטיות ושימוש במידע</strong><br />
                    מדיניות הפרטיות שלנו מפרטת את אופן השימוש במידע האישי שאתם מספקים. בשימוש באתר, אתם מסכימים למדיניות זו.
                </p>
                <p>
                    <strong>5. קניין רוחני</strong><br />
                    כל הזכויות שמורות לאמפתיק. אין לשכפל, להפיץ או להשתמש בתכנים מהאתר ללא היתר מפורש מראש.
                </p>
                <p>
                    <strong>6. ויתור על תביעות</strong><br />
                    בשימוש באתר, אתם מסכימים לוותר על כל תביעה נגד בעלי האתר והצוות התפעולי, בהקשר לשימושכם באספקת השירותים שלנו.
                </p>
                <p>
                    <strong>7. תנאי שימוש</strong><br />
                    אין להשתמש באתר לשום מטרה בלתי חוקית או לא מוסרית. אתם מתחייבים לפעול בהגינות ובכבוד כלפי משתמשים אחרים.
                </p>
                <p>
                    <strong>8. שינויים בתקנון</strong><br />
                    אנו שומרים לעצמנו את הזכות לשנות ולעדכן תקנון זה מעת לעת. מומלץ לבדוק את התנאים תקופתית.
                </p>
            </div>
            <div className="terms-checkbox-container">
                <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={handleCheckboxChange}
                />
                <label>קראתי את התקנון במלואו ואני מסכים לכל מה שנאמר בו</label>
            </div>
            <button
                className="terms-accept-button"
                onClick={handleAccept}
                disabled={!isChecked}
            >
                Accept
            </button>
        </div>
    );
};

export default TermsAndConditions;