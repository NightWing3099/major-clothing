import { useState, useContext, useCallback } from 'react';
import { UserContext } from '../../context/user.context';
import FormInput from '../form-input/form-input.component';
import Button from '../button/button.component';
import './sign-up-form.styles.scss';

const defaultFormFields = {
  displayName: '',
  email: '',
  password: '',
  confirmPassword: '',
};

const SignUpForm = () => {
  const [formFields, setFormFields] = useState(defaultFormFields);
  const { displayName, email, password, confirmPassword } = formFields;
  const { signInWithEmail } = useContext(UserContext);

  const resetFormFields = useCallback(() => {
    setFormFields(defaultFormFields);
  }, []);

  const handleSubmit = useCallback(
    async (event) => {
      event.preventDefault();

      if (password !== confirmPassword) {
        alert('Passwords do not match');
        return;
      }

      try {
        await signInWithEmail(email, password, { displayName });
        resetFormFields();
      } catch (error) {
        alert(error.message || 'Account creation failed');
      }
    },
    [displayName, email, password, confirmPassword, signInWithEmail, resetFormFields]
  );

  const handleChange = useCallback((event) => {
    const { name, value } = event.target;
    setFormFields((prev) => ({ ...prev, [name]: value }));
  }, []);

  return (
    <div className="sign-up-container">
      <h2>Don't have an account?</h2>
      <span>Sign up with your email and password</span>
      <form onSubmit={handleSubmit}>
        <FormInput
          label="Display Name"
          type="text"
          onChange={handleChange}
          name="displayName"
          value={displayName}
          required
        />
        <FormInput
          label="Email"
          type="email"
          onChange={handleChange}
          name="email"
          value={email}
          required
        />
        <FormInput
          label="Password"
          type="password"
          onChange={handleChange}
          name="password"
          value={password}
          required
        />
        <FormInput
          label="Confirm Password"
          type="password"
          onChange={handleChange}
          name="confirmPassword"
          value={confirmPassword}
          required
        />
        <Button type="submit">Sign Up</Button>
      </form>
    </div>
  );
};

export default SignUpForm;