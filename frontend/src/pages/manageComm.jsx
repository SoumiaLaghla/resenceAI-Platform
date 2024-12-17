import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom'; // Import useParams
import api from '../api';
import '../styles/manage.css'; // Import CSS file

const ManageCommunityMembers = () => {
    const { community_id } = useParams(); // Extract communityId from the URL
    const [members, setMembers] = useState([]);
    const [allUsers, setAllUsers] = useState([]);
    const [selectedMembers, setSelectedMembers] = useState([]);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await api.get('/api/users/');
                setAllUsers(response.data);
            } catch (error) {
                console.error('Error fetching users:', error);
            }
        };

        const fetchCommunityMembers = async () => {
            if (!community_id) {
                console.error('Community ID is undefined');
                return;
            }

            try {
                const response = await api.get(`/api/communities/members/${community_id}/`);
                setMembers(response.data.members);
            } catch (error) {
                console.error('Error fetching community members:', error);
            }
        };

        fetchUsers();
        fetchCommunityMembers();
    }, [community_id]);

    const handleAddMembers = async () => {
        try {
            const response = await api.post(`/api/communities/manage_members/${community_id}/`, {
                member_ids: selectedMembers,
            });

            if (response.data.error) {
                alert(response.data.error);
                return;
            }

            alert('Members added successfully');
            setSelectedMembers([]);
            const fetchMembers = await api.get(`/api/communities/members/${community_id}/`);
            setMembers(fetchMembers.data.members);
        } catch (error) {
            console.error('Error adding members:', error);
            if (error.response && error.response.status === 400) {
                alert('One or more selected users are already members of this community.');
            } else {
                alert('Error adding members');
            }
        }
    };

    const handleRemoveMembers = async (memberId) => {
        try {
            await api.delete(`/api/communities/manage_members/${community_id}/`, {
                data: {
                    member_ids: [memberId],
                },
            });
            alert('Member removed successfully');
            const response = await api.get(`/api/communities/members/${community_id}/`);
            setMembers(response.data.members);
        } catch (error) {
            console.error('Error removing member:', error);
            alert('Error removing member');
        }
    };

    return (
        <div className="manage-community-members">
            <h2>Manage Community Members</h2>
            <h3>Current Members</h3>
            <table>
                <thead>
                    <tr>
                        <th>Username</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {members.map(member => (
                        <tr key={member.id}>
                            <td>{member.username}</td>
                            <td>
                                <button onClick={() => handleRemoveMembers(member.id)}>Remove</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <h3>Add Members</h3>
            <div className="add-members-container">
                <select
                    multiple
                    value={selectedMembers}
                    onChange={(e) => {
                        const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
                        setSelectedMembers(selectedOptions);
                    }}
                    className="member-select"
                >
                    {allUsers.map(user => (
                        <option key={user.id} value={user.id}>
                            {user.username}
                        </option>
                    ))}
                </select>
                <button className="add-member-button" onClick={handleAddMembers}>Add Members</button>
            </div>
        </div>
    );
};

export default ManageCommunityMembers;
