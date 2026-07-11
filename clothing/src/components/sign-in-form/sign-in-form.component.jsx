import { useState, useContext, useCallback } from 'react';
import { UserContext } from '../../context/user.context';
import FormInput from '../form-input/form-input.component';
import Button from '../button/button.component';
import './sign-in-form.styles.scss';

const defaultFormFields = {
  email: '',
  password: '',
};

const SignInForm = () => {
  const [formFields, setFormFields] = useState(defaultFormFields);
  const { email, password } = formFields;
  const { signInWithEmail } = useContext(UserContext);

  const resetFormFields = useCallback(() => {
    setFormFields(defaultFormFields);
  }, []);

  const handleSubmit = useCallback(
    async (event) => {
      event.preventDefault();

      try {
        await signInWithEmail(email, password);
        resetFormFields();
      } catch (error) {
        alert(error.message || 'Sign in failed');
      }
    },
    [email, password, signInWithEmail, resetFormFields]
  );

  const handleChange = useCallback(
    (event) => {
      const { name, value } = event.target;
      setFormFields((prev) => ({ ...prev, [name]: value }));
    },
    []
  );

  return (
    <div className="sign-in-container">
      <h2>Already have an account?</h2>
      <span>Sign in with your email and password</span>
      <form onSubmit={handleSubmit}>
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
        <div className="buttons-container">
          <Button type="submit">Sign In</Button>
        </div>
      </form>
    </div>
  );
};

export default SignInForm;