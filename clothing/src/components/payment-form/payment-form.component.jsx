import { useState } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useCart } from '../../context/cart.context';
import Button from '../../components/button/button.component';
import { PaymentFormContainer, FormContainer } from './payment-form.styles';

const PaymentForm = () => {
  const stripe = useStripe();
  const elements = useElements();
  const { cartTotal } = useCart();
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState('');

  const paymentHandler = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    setPaymentStatus('');

    try {
      const response = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ amount: cartTotal }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Unable to initialize payment');
      }

      const { error, paymentIntent } = await stripe.confirmCardPayment(
        data.clientSecret,
        {
          payment_method: {
            card: elements.getElement(CardElement),
            billing_details: {
              name: 'Major Clothing Customer',
            },
          },
        }
      );

      if (error) {
        setPaymentStatus(error.message);
      } else if (paymentIntent.status === 'succeeded') {
        setPaymentStatus('Payment successful!');
      } else {
        setPaymentStatus(`Payment status: ${paymentIntent.status}`);
      }
    } catch (error) {
      console.error('Payment error:', error);
      setPaymentStatus(error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <PaymentFormContainer>
      <FormContainer onSubmit={paymentHandler}>
        <h2>Credit Card Payment: </h2>
        <CardElement />
        <Button buttonType='inverted' disabled={isProcessing}>
          {isProcessing ? 'Processing...' : 'Pay Now'}
        </Button>
        {paymentStatus && <p className='payment-status'>{paymentStatus}</p>}
      </FormContainer>
    </PaymentFormContainer>
  );
};

export default PaymentForm;
