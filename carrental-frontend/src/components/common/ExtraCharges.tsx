import React, { useState, useEffect } from 'react';
import { FiShield, FiNavigation, FiUserPlus, FiCheck } from 'react-icons/fi';
import { FaRupeeSign, FaBaby } from 'react-icons/fa';

// Icon aliases
const Shield = FiShield;
const Navigation = FiNavigation;
const Baby = FaBaby;
const UserPlus = FiUserPlus;
const IndianRupee = FaRupeeSign;
const Check = FiCheck;

interface ExtraChargesProps {
  rentalDays: number;
  onExtrasChange: (extras: ExtrasInfo) => void;
}

export interface ExtrasInfo {
  insurance: boolean;
  gps: boolean;
  childSeat: boolean;
  additionalDrivers: number;
  totalExtraCharges: number;
  breakdown: {
    insurance: number;
    gps: number;
    childSeat: number;
    additionalDrivers: number;
  };
}

const RATES = {
  insurance: 150, // per day
  gps: 50, // per day
  childSeat: 75, // per day
  additionalDriver: 100, // per day per driver
};

const ExtraCharges: React.FC<ExtraChargesProps> = ({
  rentalDays = 1,
  onExtrasChange
}) => {
  const [insurance, setInsurance] = useState(false);
  const [gps, setGps] = useState(false);
  const [childSeat, setChildSeat] = useState(false);
  const [additionalDrivers, setAdditionalDrivers] = useState(0);

  useEffect(() => {
    const breakdown = {
      insurance: insurance ? RATES.insurance * rentalDays : 0,
      gps: gps ? RATES.gps * rentalDays : 0,
      childSeat: childSeat ? RATES.childSeat * rentalDays : 0,
      additionalDrivers: additionalDrivers * RATES.additionalDriver * rentalDays,
    };

    const totalExtraCharges = Object.values(breakdown).reduce((a, b) => a + b, 0);

    onExtrasChange({
      insurance,
      gps,
      childSeat,
      additionalDrivers,
      totalExtraCharges,
      breakdown,
    });
  }, [insurance, gps, childSeat, additionalDrivers, rentalDays]);

  const extras = [
    {
      id: 'insurance',
      icon: Shield,
      title: 'Comprehensive Insurance',
      description: 'Full coverage for accidents, theft & damage',
      rate: RATES.insurance,
      checked: insurance,
      onChange: () => setInsurance(!insurance),
      color: 'blue',
      recommended: true,
    },
    {
      id: 'gps',
      icon: Navigation,
      title: 'GPS Navigation',
      description: 'Turn-by-turn navigation with live traffic',
      rate: RATES.gps,
      checked: gps,
      onChange: () => setGps(!gps),
      color: 'green',
    },
    {
      id: 'childSeat',
      icon: Baby,
      title: 'Child Safety Seat',
      description: 'Age-appropriate car seat for children',
      rate: RATES.childSeat,
      checked: childSeat,
      onChange: () => setChildSeat(!childSeat),
      color: 'pink',
    },
  ];

  const colorClasses: Record<string, { bg: string; border: string; text: string; icon: string }> = {
    blue: {
      bg: 'bg-blue-50',
      border: 'border-blue-500',
      text: 'text-blue-700',
      icon: 'bg-blue-500',
    },
    green: {
      bg: 'bg-green-50',
      border: 'border-green-500',
      text: 'text-green-700',
      icon: 'bg-green-500',
    },
    pink: {
      bg: 'bg-pink-50',
      border: 'border-pink-500',
      text: 'text-pink-700',
      icon: 'bg-pink-500',
    },
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 space-y-6">
      <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
        <Shield className="w-5 h-5 text-yellow-500" />
        Extra Options & Add-ons
      </h3>

      {/* Extra Options */}
      <div className="space-y-3">
        {extras.map((extra) => {
          const colors = colorClasses[extra.color];
          const Icon = extra.icon;
          
          return (
            <div
              key={extra.id}
              onClick={extra.onChange}
              className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 ${
                extra.checked
                  ? `${colors.bg} ${colors.border} shadow-md`
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              {extra.recommended && (
                <span className="absolute -top-2 right-4 px-2 py-0.5 bg-yellow-500 text-white text-xs font-medium rounded-full">
                  Recommended
                </span>
              )}
              
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl ${extra.checked ? colors.icon : 'bg-gray-100'} transition-colors`}>
                  <Icon className={`w-6 h-6 ${extra.checked ? 'text-white' : 'text-gray-500'}`} />
                </div>
                
                <div className="flex-1">
                  <h4 className={`font-medium ${extra.checked ? colors.text : 'text-gray-800'}`}>
                    {extra.title}
                  </h4>
                  <p className="text-sm text-gray-500">{extra.description}</p>
                </div>
                
                <div className="text-right">
                  <p className="font-semibold text-gray-800 flex items-center">
                    <IndianRupee className="w-4 h-4" />
                    {extra.rate}
                    <span className="text-sm text-gray-400 font-normal">/day</span>
                  </p>
                  {extra.checked && rentalDays > 1 && (
                    <p className="text-xs text-gray-500">
                      Total: ₹{extra.rate * rentalDays}
                    </p>
                  )}
                </div>
                
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                  extra.checked
                    ? `${colors.icon} border-transparent`
                    : 'border-gray-300'
                }`}>
                  {extra.checked && <Check className="w-4 h-4 text-white" />}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Additional Drivers */}
      <div className="p-4 rounded-xl border-2 border-gray-200">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-purple-100">
            <UserPlus className="w-6 h-6 text-purple-600" />
          </div>
          
          <div className="flex-1">
            <h4 className="font-medium text-gray-800">Additional Drivers</h4>
            <p className="text-sm text-gray-500">Add more authorized drivers</p>
          </div>
          
          <div className="text-right mr-4">
            <p className="font-semibold text-gray-800 flex items-center">
              <IndianRupee className="w-4 h-4" />
              {RATES.additionalDriver}
              <span className="text-sm text-gray-400 font-normal">/driver/day</span>
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setAdditionalDrivers(Math.max(0, additionalDrivers - 1))}
              className="w-10 h-10 rounded-full border-2 border-gray-300 flex items-center justify-center text-gray-600 hover:border-purple-500 hover:text-purple-600 transition-colors"
              disabled={additionalDrivers === 0}
            >
              -
            </button>
            <span className="w-8 text-center font-semibold text-lg">{additionalDrivers}</span>
            <button
              type="button"
              onClick={() => setAdditionalDrivers(Math.min(3, additionalDrivers + 1))}
              className="w-10 h-10 rounded-full border-2 border-gray-300 flex items-center justify-center text-gray-600 hover:border-purple-500 hover:text-purple-600 transition-colors"
              disabled={additionalDrivers === 3}
            >
              +
            </button>
          </div>
        </div>
        
        {additionalDrivers > 0 && (
          <div className="mt-3 pt-3 border-t border-gray-100 text-right">
            <p className="text-sm text-gray-500">
              {additionalDrivers} driver(s) × {rentalDays} day(s) × ₹{RATES.additionalDriver} = 
              <span className="font-semibold text-purple-600 ml-1">
                ₹{additionalDrivers * rentalDays * RATES.additionalDriver}
              </span>
            </p>
          </div>
        )}
      </div>

      {/* Total Summary */}
      {(insurance || gps || childSeat || additionalDrivers > 0) && (
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-4 border border-yellow-200">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-600">Total Extra Charges</p>
              <p className="text-xs text-gray-400">For {rentalDays} day(s)</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-yellow-600 flex items-center">
                <IndianRupee className="w-5 h-5" />
                {(insurance ? RATES.insurance * rentalDays : 0) +
                  (gps ? RATES.gps * rentalDays : 0) +
                  (childSeat ? RATES.childSeat * rentalDays : 0) +
                  additionalDrivers * RATES.additionalDriver * rentalDays}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExtraCharges;
