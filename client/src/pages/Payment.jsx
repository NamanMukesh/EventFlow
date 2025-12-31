import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { loadStripe } from "@stripe/stripe-js";
import { 
  Elements, 
  CardNumberElement, 
  CardExpiryElement, 
  CardCvcElement,
  useStripe, 
  useElements 
} from "@stripe/react-stripe-js";
import { useAuth } from "../hooks/useAuth";
import API from "../utils/axios.util";
import toast from "react-hot-toast";
import Navbar from "../components/Navbar";

// Initialize Stripe (use your publishable key from .env or hardcode for test)
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || "pk_test_51Q...");

// Payment form component that uses Stripe Elements
const PaymentForm = ({ booking, clientSecret, paymentIntentId, onSuccess }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [cardholderName, setCardholderName] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) {
      toast.error("Stripe is not loaded. Please refresh the page.");
      return;
    }

    const cardNumberElement = elements.getElement(CardNumberElement);
    const cardExpiryElement = elements.getElement(CardExpiryElement);
    const cardCvcElement = elements.getElement(CardCvcElement);

    if (!cardNumberElement || !cardExpiryElement || !cardCvcElement) {
      toast.error("Card elements not found");
      return;
    }

    if (!cardholderName.trim()) {
      toast.error("Please enter cardholder name");
      return;
    }

    try {
      setProcessing(true);
      toast.success("Processing payment...");

      // Create payment method from separate card elements
      const { error: pmError, paymentMethod } = await stripe.createPaymentMethod({
        type: "card",
        card: cardNumberElement,
        billing_details: {
          name: cardholderName
        }
      });

      if (pmError) {
        toast.error(pmError.message || "Failed to create payment method");
        return;
      }

      // Confirm payment using the payment method
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: paymentMethod.id
      });

      if (error) {
        // Handle specific error types
        let errorMessage = error.message || "Payment failed";
        
        if (error.type === "card_error" || error.type === "validation_error") {
          if (error.code === "card_declined") {
            if (error.decline_code === "insufficient_funds") {
              errorMessage = "Payment declined: Insufficient funds";
            } else if (error.decline_code === "lost_card") {
              errorMessage = "Payment declined: Card reported as lost";
            } else if (error.decline_code === "stolen_card") {
              errorMessage = "Payment declined: Card reported as stolen";
            } else if (error.decline_code === "generic_decline") {
              errorMessage = "Payment declined: Card was declined";
            } else {
              errorMessage = `Payment declined: ${error.message}`;
            }
          } else if (error.code === "expired_card") {
            errorMessage = "Payment declined: Card has expired";
          } else if (error.code === "incorrect_cvc") {
            errorMessage = "Payment declined: Incorrect CVC";
          }
        }
        
        toast.error(errorMessage);
        console.error("Payment error:", error);
        return;
      }

      if (paymentIntent && paymentIntent.status === "succeeded") {
        // Payment succeeded - notify backend to update booking
        try {
          const confirmResponse = await API.post("/api/payment/confirm", {
            bookingId: booking._id,
            paymentIntentId: paymentIntentId,
          });

          if (confirmResponse.data.success) {
            toast.success("Payment confirmed successfully!");
            onSuccess();
          } else {
            toast.error(confirmResponse.data.message || "Failed to confirm booking");
          }
        } catch (confirmError) {
          console.error("Booking confirmation error:", confirmError);
          toast.error("Payment succeeded but failed to update booking. Please contact support.");
        }
      }
    } catch (error) {
      console.error("Payment processing error:", error);
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setProcessing(false);
    }
  };

  const elementOptions = {
    style: {
      base: {
        fontSize: "16px",
        color: "#1f2937",
        fontFamily: "system-ui, sans-serif",
        "::placeholder": {
          color: "#9ca3af",
        },
      },
      invalid: {
        color: "#dc2626",
        iconColor: "#dc2626",
      },
    },
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Cardholder Name
        </label>
        <input
          type="text"
          value={cardholderName}
          onChange={(e) => setCardholderName(e.target.value)}
          placeholder="John Doe"
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition shadow-sm"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Card Number
        </label>
        <div className="px-4 py-3 border border-gray-300 rounded-lg bg-white focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent transition shadow-sm">
          <CardNumberElement options={elementOptions} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Expiry Date
          </label>
          <div className="px-4 py-3 border border-gray-300 rounded-lg bg-white focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent transition shadow-sm">
            <CardExpiryElement options={elementOptions} />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            CVV
          </label>
          <div className="px-4 py-3 border border-gray-300 rounded-lg bg-white focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent transition shadow-sm">
            <CardCvcElement options={elementOptions} />
          </div>
        </div>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
        <p className="text-sm text-yellow-800">
          <strong>Test Mode:</strong> Use test card: 4242 4242 4242 4242, any future expiry, any 3-digit CVV
        </p>
        <p className="text-xs text-yellow-700 mt-1">
          Test decline cards: 4000000000000002 (generic), 4000000000009995 (insufficient funds)
        </p>
      </div>

      <div className="flex gap-4">
        <button
          type="button"
          onClick={() => window.history.back()}
          disabled={processing}
          className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition disabled:opacity-50"
        >
          Back
        </button>
        <button
          type="submit"
          disabled={processing || !stripe}
          className="flex-1 bg-blue-600 text-white py-2 rounded-md font-medium hover:bg-blue-700 transition disabled:opacity-50"
        >
          {processing ? "Processing Payment..." : "Confirm Payment"}
        </button>
      </div>
    </form>
  );
};

// Main Payment component
const Payment = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [clientSecret, setClientSecret] = useState(null);
  const [paymentIntentId, setPaymentIntentId] = useState(null);
  const [showCardForm, setShowCardForm] = useState(false);

  const fetchBooking = useCallback(async () => {
    try {
      const response = await API.get(`/api/bookings/${id}`);
      if (response.data.success) {
        setBooking(response.data.booking);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load booking");
      navigate("/events");
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    fetchBooking();
  }, [isAuthenticated, navigate, fetchBooking]);

  const handleProceedToPayment = async () => {
    if (!booking) return;

    try {
      setLoading(true);

      // Create payment intent
      const intentResponse = await API.post("/api/payment/create-intent", {
        bookingId: booking._id,
      });

      if (!intentResponse.data.success) {
        toast.error(intentResponse.data.message || "Failed to create payment intent");
        return;
      }

      // Store client secret and payment intent ID
      setClientSecret(intentResponse.data.clientSecret);
      setPaymentIntentId(intentResponse.data.paymentIntentId);
      setShowCardForm(true);
      toast.success("Payment intent created. Please enter card details.");
    } catch (error) {
      console.error("Payment error:", error);
      const errorMessage = error.response?.data?.message || "Payment failed";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = () => {
    navigate("/my-bookings");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!booking) {
    return null;
  }

  const totalPrice = booking.event?.price * booking.seatsBooked || 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Complete Payment</h1>

        <div className="bg-white rounded-lg shadow-sm border p-6 space-y-6">
          <div>
            <h2 className="text-xl font-semibold mb-4">Booking Summary</h2>
            <div className="space-y-2 text-gray-700">
              <p><strong>Event:</strong> {booking.event?.title}</p>
              <p><strong>Date:</strong> {new Date(booking.eventDate).toLocaleDateString()}</p>
              <p><strong>Time:</strong> {booking.slotTime}</p>
              <p><strong>Seats:</strong> {booking.seatsBooked}</p>
            </div>
          </div>

          <div className="border-t pt-4">
            <div className="flex justify-between items-center text-xl font-semibold">
              <span>Total Amount</span>
              <span className="text-blue-600">${totalPrice.toFixed(2)}</span>
            </div>
          </div>

          {!showCardForm ? (
            <>
              <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> Payment will be processed securely via Stripe. Click below to proceed to payment.
                </p>
              </div>

              <button
                onClick={handleProceedToPayment}
                disabled={loading || booking.paymentStatus === "paid"}
                className="w-full bg-blue-600 text-white py-3 rounded-md font-medium hover:bg-blue-700 transition disabled:opacity-50"
              >
                {loading
                  ? "Preparing Payment..."
                  : booking.paymentStatus === "paid"
                  ? "Already Paid"
                  : "Proceed to Payment"}
              </button>
            </>
          ) : clientSecret ? (
            <div className="border-t pt-6">
              <h2 className="text-xl font-semibold mb-4">Card Details</h2>
              <Elements stripe={stripePromise} options={{ clientSecret }}>
                <PaymentForm
                  booking={booking}
                  clientSecret={clientSecret}
                  paymentIntentId={paymentIntentId}
                  onSuccess={handlePaymentSuccess}
                />
              </Elements>
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-gray-600">Loading payment form...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Payment;
