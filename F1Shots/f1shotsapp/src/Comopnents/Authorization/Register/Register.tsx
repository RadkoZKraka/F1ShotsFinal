import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import './Register.less';  // Importing LESS styles

const Register = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [passwordsMatch, setPasswordsMatch] = useState(true);
    const [usernameError, setUsernameError] = useState(''); // Track username error
    const navigate = useNavigate(); // Initialize navigate

    const checkUsernameAvailability = async (username: string) => {
        if (username.length > 2) {  // Trigger check only when username is more than 2 characters
            try {
                const response = await axios.get(`https://localhost:44388/api/auth/check-username?username=${username}`);
                if (response.data.isTaken) {
                    setUsernameError('Username is already taken');
                } else {
                    setUsernameError('');
                }
            } catch (error) {
                setUsernameError('Error checking username availability');
            }
        } else {
            setUsernameError('');
        }
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!username || !email || !password || !confirmPassword) {
            setErrorMessage('Please fill in all fields');
            return;
        }

        if (!passwordsMatch) {
            setErrorMessage('Passwords do not match');
            return;
        }

        if (usernameError) {
            setErrorMessage('Please fix the username error');
            return;
        }

        setIsLoading(true);

        try {
            const response = await axios.post('https://localhost:44388/api/auth/register', {
                username,
                email,
                password,
            });
            if (response.status === 200) {
                // Redirect to landing page after successful registration
                navigate('/landing');
            }
        } catch (error: unknown) {
            if (error instanceof axios.AxiosError && error.response) {
                if (error.response.status === 400) {
                    setErrorMessage(error.response.data.message);
                }
            } else {
                setErrorMessage('Registration failed. Please try again.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newUsername = e.target.value;
        setUsername(newUsername);
        setUsernameError('');
        checkUsernameAvailability(newUsername); // Check username availability
    };

    const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const confirmPasswordValue = e.target.value;
        setConfirmPassword(confirmPasswordValue);
        setPasswordsMatch(password === confirmPasswordValue);
    };

    return (
        <div className="register-container">
            <h2>Register</h2>
            <form onSubmit={handleSubmit}>
                <div className="input-group">
                    <label>Username</label>
                    <input
                        type="text"
                        placeholder="Enter your username"
                        value={username}
                        onChange={handleUsernameChange}
                        required
                    />
                    {usernameError && <p className="error-message">{usernameError}</p>}
                </div>
                <div className="input-group">
                    <label>Email</label>
                    <input
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>
                <div className="input-group">
                    <label>Password</label>
                    <input
                        type="password"
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                <div className="input-group">
                    <label>Confirm Password</label>
                    <input
                        type="password"
                        placeholder="Confirm your password"
                        value={confirmPassword}
                        onChange={handleConfirmPasswordChange}
                        required
                    />
                    {!passwordsMatch && confirmPassword.length > 0 && (
                        <p className="error-message">Passwords do not match</p>
                    )}
                </div>
                {errorMessage && <p className="error-message">{errorMessage}</p>}
                <div>
                    <button type="submit" disabled={isLoading || !passwordsMatch || !!usernameError}>
                        {isLoading ? 'Registering...' : 'Register'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default Register;
