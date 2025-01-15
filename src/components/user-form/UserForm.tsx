import React, { useState, ChangeEvent, FormEvent } from 'react';
import { Gender } from '../../data/data';

export interface UserFormData {
    firstName: string;
    lastName: string;
    gender: Gender;
    age: number;
}

interface UserFormProps {
    onSubmit: (formData: UserFormData) => void;
}

export const UserForm: React.FC<UserFormProps> = ({ onSubmit }) => {
    const [userFormData, setUserFormData] = useState<UserFormData>({
        firstName: '',
        lastName: '',
        gender: Gender.Other,
        age: 0
    });

    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setUserFormData({
            ...userFormData,
            [name]: name === 'age' ? Number(value) : value
        });
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        onSubmit(userFormData);
    };

    return (
        <form className="user-form-container" onSubmit={handleSubmit}>
            <div className="user-form-group">
                <label>שמך הפרטי</label>
                <input
                    type="text"
                    name="firstName"
                    value={userFormData.firstName}
                    onChange={handleChange}
                    required
                />
            </div>
            <div className="user-form-group">
                <label>שם משפחתך</label>
                <input
                    type="text"
                    name="lastName"
                    value={userFormData.lastName}
                    onChange={handleChange}
                    required
                />
            </div>
            <div className="user-form-group">
                <label>איך לפנות אליך ?</label>
                <select
                    name="gender"
                    value={userFormData.gender}
                    onChange={handleChange}
                    required
                >
                    <option value={Gender.Male}>זכר</option>
                    <option value={Gender.Female}>נקבה</option>
                    <option value={Gender.Other}>אחר</option>
                </select>
            </div>
            <div className="user-form-group">
                <label>מהו גילך ?</label>
                <input
                    type="number"
                    name="age"
                    value={userFormData.age}
                    onChange={handleChange}
                    required
                />
            </div>
            <button className="user-form-submit-button" type="submit">Submit</button>
        </form>
    );
};

export default UserForm;