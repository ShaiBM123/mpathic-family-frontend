import React, { useState } from "react";
import Dropdown from "react-bootstrap/Dropdown";
// import FormControl from "react-bootstrap/FormControl";
import { Button } from "react-bootstrap";

interface IFeeling {
  id: number;
  feeling_name: string;
}

export const HebFeelings: IFeeling[] = [
  { "id": 1, "feeling_name": "אהבה" },
  { "id": 2, "feeling_name": "אומץ" },
  { "id": 3, "feeling_name": "אושר" },
  { "id": 4, "feeling_name": "אכזבה" },
  { "id": 5, "feeling_name": "בדידות" },
  { "id": 6, "feeling_name": "ביטחון" },
  { "id": 7, "feeling_name": "בלבול" },
  { "id": 8, "feeling_name": "בושה" },
  { "id": 9, "feeling_name": "גאווה" },
  { "id": 10, "feeling_name": "גועל" },
  { "id": 11, "feeling_name": "דאגה" },
  { "id": 12, "feeling_name": "דיכאון" },
  { "id": 13, "feeling_name": "הערכה" },
  { "id": 14, "feeling_name": "הכרת תודה" },
  { "id": 15, "feeling_name": "זעם" },
  { "id": 16, "feeling_name": "חיבה" },
  { "id": 17, "feeling_name": "חיוך" },
  { "id": 18, "feeling_name": "חמלה" },
  { "id": 19, "feeling_name": "חרטה" },
  { "id": 20, "feeling_name": "חשש" },
  { "id": 21, "feeling_name": "כעס" },
  { "id": 22, "feeling_name": "מבוכה" },
  { "id": 23, "feeling_name": "נאמנות" },
  { "id": 24, "feeling_name": "ניצחון" },
  { "id": 25, "feeling_name": "עצב" },
  { "id": 26, "feeling_name": "פחד" },
  { "id": 27, "feeling_name": "פסימיות" },
  { "id": 28, "feeling_name": "קנאה" },
  { "id": 29, "feeling_name": "רוגע" },
  { "id": 30, "feeling_name": "שמחה" },
  { "id": 31, "feeling_name": "תסכול" }
];



// type CustomMenuProps = {
//   children?: React.ReactNode;
//   style?: React.CSSProperties;
//   className?: string;
//   labeledBy?: string;
// };

// forwardRef again here!
// Dropdown needs access to the DOM of the Menu to measure it

// const CustomMenu = React.forwardRef(
//   (props: CustomMenuProps, ref: React.Ref<HTMLDivElement>) => {
//     const [value, setValue] = useState("");

//     return (
//       <div
//         ref={ref}
//         style={props.style}
//         className={props.className}
//         aria-labelledby={props.labeledBy}
//       >
//         <FormControl
//           autoFocus
//           className="mx-3 my-2 w-auto"
//           placeholder="הקלד רגש"
//           onChange={e => setValue(e.target.value)}
//           value={value}
//         />
//         <ul className="list-unstyled">
//           {React.Children.toArray(props.children).filter(
//             (child: any) =>
//               !value || child.props.children.toLowerCase().startsWith(value)
//           )}
//         </ul>
//       </div>
//     );
//   }
// );


export const DropdownFeelingSelector =
  ({ onClick }: { onClick?: React.MouseEventHandler }) => {
    const [selectedFeeling, setSelectedFeeling] = useState(0);

    const getSelectedFeeling = () => {
      const feeling: IFeeling | undefined = HebFeelings.find(f => f.id === selectedFeeling);
      return feeling
        ? 'הוסף ' + feeling.feeling_name
        : "בחר רגש ...";
    };
    const getSelectedFeelingId = () => {
      return selectedFeeling === 0 ? undefined : String(selectedFeeling)
    };

    const rtl = process.env.REACT_APP_RTL

    return (
      <Dropdown onSelect={(e) => setSelectedFeeling(Number(e))}>
        <Button variant="info" size="sm" className="bg-white text-dark border-dark rounded"
          id={getSelectedFeelingId()} onClick={onClick}>
          {getSelectedFeeling()}
        </Button>

        <Dropdown.Toggle
          split
          variant="info"
          size="sm"
          className="bg-white text-dark border-dark rounded"
          id="dropdown-custom-components" />

        {/* <Dropdown.Menu as={CustomMenu}> */}
        <Dropdown.Menu>
          {HebFeelings.map(fruit => {
            return (
              <Dropdown.Item className={rtl === 'yes' ? "rtl-dropdown-item" : ""} key={fruit.id} eventKey={fruit.id.toString()}>
                {fruit.feeling_name}
              </Dropdown.Item>
            );
          })}
        </Dropdown.Menu>
      </Dropdown>
    );
  };
