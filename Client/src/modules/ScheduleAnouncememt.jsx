import React, { useState, useEffect } from 'react';
import { Input } from '../components/Input';
import { useNavigate } from 'react-router-dom';
import AudioRecorder from '../components/AudioRecorder';
import CampusRoomSelector from './CampusRoomSelector';

export const ScheduleAnouncementsPage = () => {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        AnouncementName: '',
        Description: '',
        date: '',
        time: '',
        audio: '',
    });

    const [selectedData, setSelectedData] = useState({
        selectedCampuses: [],
        availableRooms: [],
    });

    const handleChange = (fieldName, value) => {
        setFormData((prevData) => ({
            ...prevData,
            [fieldName]: value,
        }));
    };

    const handlechangeSubmit = (data) => {
        setSelectedData(data);
    };

    const handleAudioRecordingComplete = (audioBase64) => {
        // Update the state with the audioBase64 data
        setFormData((prevData) => ({
            ...prevData,
            audio: audioBase64,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        // Merge form data with selected campuses and available rooms
        const mergedData = {
            ...formData,
            ...selectedData,
        };

        // API Call
        const response = await fetch('http://localhost:5000/api/add/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'auth-token': localStorage.getItem('token'),
            },
            body: JSON.stringify(mergedData),
        });

        if (response.ok) {
            const json = await response.json();
            console.log(json);
            setFormData({
                AnouncementName: '',
                Description: '',
                date: '',
                time: '',
            });
            setSelectedData({
                selectedCampuses: [],
                availableRooms: [],
            });
            navigate('/update');
        } else {
            console.error('Failed to create announcement');
        }
    };

    return (
        <div className="mt-16 text-lg font-semibold">
            <h1 className="w-[80%] m-auto mb-4">Create Announcement:</h1>
            <form className="bg-white w-[80%] rounded-lg m-auto pb-16 flex flex-col" onSubmit={handleSubmit}>
                <div>
                    <div className="flex flex-row flex-wrap">
                        <Input type="text" name="AnouncementName" placeholder="e.g. meet in Auditorium" label="Announcement Name:" className="" onChange={handleChange} />
                        <Input type="text" name="Description" placeholder="5 - 6 words of Description (if any)" label="Announcement Description:" className="" onChange={handleChange} />
                    </div>
                    <div className="flex flex-row w-full">
                        <div className="flex flex-row w-1/2">
                            <Input type="date" name="date" label="Date:" className="" onChange={handleChange} />
                            <Input type="time" name="time" label="Time:" classNameDiv="ms-0 w-[41%]" onChange={handleChange} />
                        </div>
                        <div className="w-1/2 pt-8">
                            <AudioRecorder onAudioRecordingComplete={handleAudioRecordingComplete}/>
                        </div>
                    </div>
                    <CampusRoomSelector onSubmit={handlechangeSubmit} />
                    <Input type="text" name="audioFileName" label="Audio File Name:" onChange={handleChange} placeholder="eg. Nation"/>
                </div>
                <button className="block p-2 bg-blue-600 rounded-lg w-1/5 mx-auto mt-8 text-white font-semibold">Add Announcement</button>
            </form>
        </div>
    );
};
