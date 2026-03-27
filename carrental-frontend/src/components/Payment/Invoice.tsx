import React, { useRef } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { FiDownload, FiPrinter, FiArrowLeft } from 'react-icons/fi';

interface InvoiceData {
  invoiceNumber: string;
  invoiceDate: string;
  bookingId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  vehicleName: string;
  vehicleType: string;
  pickupDate: string;
  pickupTime: string;
  dropoffDate: string;
  dropoffTime: string;
  pickupLocation: string;
  dropoffLocation: string;
  dailyRate: number;
  numberOfDays: number;
  subtotal: number;
  discount: number;
  couponDiscount: number;
  extraCharges: number;
  deliveryFee: number;
  tax: number;
  totalAmount: number;
  paymentMethod: string;
  transactionId: string;
  paymentStatus: string;
}

const Invoice: React.FC = () => {
  const { bookingId } = useParams<{ bookingId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const invoiceRef = useRef<HTMLDivElement>(null);

  // Get invoice data from location state or create sample data
  const invoiceData: InvoiceData = location.state?.invoiceData || {
    invoiceNumber: `INV-${Date.now()}`,
    invoiceDate: new Date().toLocaleDateString('en-IN'),
    bookingId: bookingId || 'BK-001',
    customerName: 'Divya Dharshini',
    customerEmail: 'divyadharshini508205@gmail.com',
    customerPhone: '+91 9876543210',
    vehicleName: 'Toyota Fortuner',
    vehicleType: 'SUV',
    pickupDate: '2026-03-15',
    pickupTime: '10:00 AM',
    dropoffDate: '2026-03-20',
    dropoffTime: '10:00 AM',
    pickupLocation: 'Chennai Airport',
    dropoffLocation: 'Chennai Airport',
    dailyRate: 8000,
    numberOfDays: 5,
    subtotal: 40000,
    discount: 2000,
    couponDiscount: 3000,
    extraCharges: 750,
    deliveryFee: 0,
    tax: 6750,
    totalAmount: 42500,
    paymentMethod: 'Credit Card',
    transactionId: `TXN_${Date.now()}`,
    paymentStatus: 'Paid'
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    // In production, this would generate a PDF
    const element = invoiceRef.current;
    if (element) {
      const printWindow = window.open('', '', 'height=600,width=800');
      if (printWindow) {
        printWindow.document.write(element.innerHTML);
        printWindow.document.close();
        printWindow.print();
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header Actions */}
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <FiArrowLeft /> Back
          </button>
          <div className="flex gap-4">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <FiPrinter /> Print
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              <FiDownload /> Download PDF
            </button>
          </div>
        </div>

        {/* Invoice */}
        <div
          ref={invoiceRef}
          className="bg-white p-12 rounded-lg shadow-lg"
          style={{ pageBreakAfter: 'always' }}
        >
          {/* Header */}
          <div className="flex justify-between items-start mb-8 border-b-2 pb-6">
            <div>
              <h1 className="text-4xl font-bold text-blue-600">MotoGlide</h1>
              <p className="text-gray-600">Car Rental Services</p>
            </div>
            <div className="text-right">
              <h2 className="text-2xl font-bold text-gray-800">INVOICE</h2>
              <p className="text-gray-600">Invoice #: {invoiceData.invoiceNumber}</p>
              <p className="text-gray-600">Date: {invoiceData.invoiceDate}</p>
            </div>
          </div>

          {/* Customer & Booking Info */}
          <div className="grid grid-cols-2 gap-8 mb-8">
            {/* Customer Info */}
            <div>
              <h3 className="text-lg font-bold text-gray-800 mb-4">Bill To:</h3>
              <div className="text-gray-700">
                <p className="font-semibold">{invoiceData.customerName}</p>
                <p>{invoiceData.customerEmail}</p>
                <p>{invoiceData.customerPhone}</p>
              </div>
            </div>

            {/* Booking Info */}
            <div>
              <h3 className="text-lg font-bold text-gray-800 mb-4">Booking Details:</h3>
              <div className="text-gray-700 space-y-1">
                <p><span className="font-semibold">Booking ID:</span> {invoiceData.bookingId}</p>
                <p><span className="font-semibold">Vehicle:</span> {invoiceData.vehicleName}</p>
                <p><span className="font-semibold">Type:</span> {invoiceData.vehicleType}</p>
              </div>
            </div>
          </div>

          {/* Rental Period */}
          <div className="bg-blue-50 p-6 rounded-lg mb-8">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Rental Period</h3>
            <div className="grid grid-cols-2 gap-8">
              <div>
                <p className="text-gray-600 text-sm">Pickup</p>
                <p className="font-semibold text-gray-800">{invoiceData.pickupDate}</p>
                <p className="text-gray-600 text-sm">{invoiceData.pickupTime}</p>
                <p className="text-gray-600 text-sm mt-2">{invoiceData.pickupLocation}</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Dropoff</p>
                <p className="font-semibold text-gray-800">{invoiceData.dropoffDate}</p>
                <p className="text-gray-600 text-sm">{invoiceData.dropoffTime}</p>
                <p className="text-gray-600 text-sm mt-2">{invoiceData.dropoffLocation}</p>
              </div>
            </div>
          </div>

          {/* Charges Table */}
          <table className="w-full mb-8">
            <thead>
              <tr className="bg-gray-200 border-b-2">
                <th className="text-left py-3 px-4 font-bold text-gray-800">Description</th>
                <th className="text-right py-3 px-4 font-bold text-gray-800">Quantity</th>
                <th className="text-right py-3 px-4 font-bold text-gray-800">Rate</th>
                <th className="text-right py-3 px-4 font-bold text-gray-800">Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b">
                <td className="py-3 px-4 text-gray-700">{invoiceData.vehicleName} - Daily Rental</td>
                <td className="text-right py-3 px-4 text-gray-700">{invoiceData.numberOfDays} days</td>
                <td className="text-right py-3 px-4 text-gray-700">₹{invoiceData.dailyRate.toLocaleString()}</td>
                <td className="text-right py-3 px-4 text-gray-700">₹{invoiceData.subtotal.toLocaleString()}</td>
              </tr>
              {invoiceData.extraCharges > 0 && (
                <tr className="border-b">
                  <td className="py-3 px-4 text-gray-700">Extra Options (Insurance, GPS, etc.)</td>
                  <td className="text-right py-3 px-4 text-gray-700">-</td>
                  <td className="text-right py-3 px-4 text-gray-700">-</td>
                  <td className="text-right py-3 px-4 text-gray-700">₹{invoiceData.extraCharges.toLocaleString()}</td>
                </tr>
              )}
              {invoiceData.deliveryFee > 0 && (
                <tr className="border-b">
                  <td className="py-3 px-4 text-gray-700">Delivery Fee</td>
                  <td className="text-right py-3 px-4 text-gray-700">-</td>
                  <td className="text-right py-3 px-4 text-gray-700">-</td>
                  <td className="text-right py-3 px-4 text-gray-700">₹{invoiceData.deliveryFee.toLocaleString()}</td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Summary */}
          <div className="flex justify-end mb-8">
            <div className="w-80">
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-700">Subtotal:</span>
                <span className="text-gray-700">₹{invoiceData.subtotal.toLocaleString()}</span>
              </div>
              {invoiceData.discount > 0 && (
                <div className="flex justify-between py-2 border-b text-green-600">
                  <span>Early Booking Discount:</span>
                  <span>-₹{invoiceData.discount.toLocaleString()}</span>
                </div>
              )}
              {invoiceData.couponDiscount > 0 && (
                <div className="flex justify-between py-2 border-b text-green-600">
                  <span>Coupon Discount:</span>
                  <span>-₹{invoiceData.couponDiscount.toLocaleString()}</span>
                </div>
              )}
              {invoiceData.extraCharges > 0 && (
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-700">Extra Charges:</span>
                  <span className="text-gray-700">+₹{invoiceData.extraCharges.toLocaleString()}</span>
                </div>
              )}
              {invoiceData.deliveryFee > 0 && (
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-700">Delivery Fee:</span>
                  <span className="text-gray-700">+₹{invoiceData.deliveryFee.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-700">Tax (18%):</span>
                <span className="text-gray-700">₹{invoiceData.tax.toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-3 bg-blue-50 px-4 rounded font-bold text-lg">
                <span className="text-gray-800">Total Amount:</span>
                <span className="text-blue-600">₹{invoiceData.totalAmount.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Payment Info */}
          <div className="bg-green-50 p-6 rounded-lg mb-8 border-l-4 border-green-600">
            <h3 className="text-lg font-bold text-gray-800 mb-3">Payment Information</h3>
            <div className="grid grid-cols-2 gap-4 text-gray-700">
              <div>
                <p className="text-sm text-gray-600">Payment Method</p>
                <p className="font-semibold">{invoiceData.paymentMethod}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Transaction ID</p>
                <p className="font-semibold">{invoiceData.transactionId}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Payment Status</p>
                <p className="font-semibold text-green-600">✓ {invoiceData.paymentStatus}</p>
              </div>
            </div>
          </div>

          {/* Terms & Conditions */}
          <div className="border-t-2 pt-6">
            <h3 className="text-lg font-bold text-gray-800 mb-3">Terms & Conditions</h3>
            <ul className="text-sm text-gray-600 space-y-2 list-disc list-inside">
              <li>Vehicle must be returned on the scheduled date and time</li>
              <li>Late returns will be charged at ₹500 per hour</li>
              <li>Customer is responsible for any damage to the vehicle</li>
              <li>Fuel tank must be returned full</li>
              <li>Free cancellation up to 24 hours before pickup</li>
              <li>For more details, refer to our complete Terms & Conditions</li>
            </ul>
          </div>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t-2 text-center text-gray-600 text-sm">
            <p>Thank you for choosing MotoGlide!</p>
            <p>For support, contact us at support@motoglide.com or +91 1800-123-4567</p>
            <p className="mt-4 text-xs text-gray-500">This is a computer-generated invoice. No signature is required.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Invoice;
