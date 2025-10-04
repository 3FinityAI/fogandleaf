import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Truck, Clock, MapPin, CheckCircle2, Package } from "lucide-react";
import {
  calculateShippingCost,
  getDeliveryOptions,
  estimateDeliveryDate,
} from "../utility/shippingCalculator";

const ShippingOptions = ({
  cartItems,
  shippingAddress,
  selectedOption,
  onOptionSelect,
  className = "",
}) => {
  const [deliveryOptions, setDeliveryOptions] = useState([]);
  const [shippingCalculation, setShippingCalculation] = useState(null);

  useEffect(() => {
    if (cartItems && cartItems.length > 0 && shippingAddress?.city) {
      // Get all delivery options
      const options = getDeliveryOptions(cartItems, shippingAddress);
      setDeliveryOptions(options);

      // Calculate shipping for currently selected option
      const calculation = calculateShippingCost(
        cartItems,
        shippingAddress,
        selectedOption
      );
      setShippingCalculation(calculation);
    }
  }, [cartItems, shippingAddress, selectedOption]);

  const handleOptionSelect = (optionId) => {
    onOptionSelect(optionId);
  };

  const formatCurrency = (amount) => `₹${amount}`;

  if (!shippingAddress?.city) {
    return (
      <Card className={`border-dashed border-secondary-300 ${className}`}>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center text-secondary-500">
            <MapPin className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>Enter shipping address to see delivery options</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Truck className="h-5 w-5" />
          Delivery Options
          {shippingCalculation?.isFreeShipping && (
            <Badge variant="secondary" className="bg-green-100 text-green-700">
              Free Shipping!
            </Badge>
          )}
        </CardTitle>
        {shippingCalculation && (
          <div className="text-sm text-secondary-600">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Delivering to {shippingAddress.city}, {shippingAddress.state}
              <Badge variant="outline">{shippingCalculation.zone}</Badge>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <Package className="h-4 w-4" />
              Total weight: {shippingCalculation.weight} kg
            </div>
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {deliveryOptions.map((option) => (
            <div
              key={option.id}
              onClick={() => handleOptionSelect(option.id)}
              className={`relative border rounded-lg p-4 cursor-pointer transition-all duration-200 hover:border-primary-300 hover:shadow-sm ${
                selectedOption === option.id
                  ? "border-primary-500 bg-primary-50 shadow-sm"
                  : "border-secondary-200"
              }`}
            >
              {/* Selection indicator */}
              {selectedOption === option.id && (
                <div className="absolute top-3 right-3">
                  <CheckCircle2 className="h-5 w-5 text-primary-600" />
                </div>
              )}

              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg">{option.icon}</span>
                    <h4 className="font-medium text-secondary-900">
                      {option.name}
                    </h4>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm text-secondary-600">
                      <Clock className="h-3 w-3" />
                      <span>{option.description}</span>
                    </div>

                    <div className="text-sm text-secondary-600">
                      <span>Estimated delivery: </span>
                      <span className="font-medium text-secondary-900">
                        {estimateDeliveryDate(option.deliveryDays)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-right ml-4">
                  <div className="text-lg font-semibold text-secondary-900">
                    {option.cost === 0 ? (
                      <span className="text-green-600">FREE</span>
                    ) : (
                      formatCurrency(option.cost)
                    )}
                  </div>
                  {option.cost > 0 && shippingCalculation?.isFreeShipping && (
                    <div className="text-xs text-secondary-500 line-through">
                      {formatCurrency(option.cost)}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Free shipping progress */}
        {shippingCalculation && !shippingCalculation.isFreeShipping && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center gap-2 text-sm">
              <Truck className="h-4 w-4 text-blue-600" />
              <span className="text-blue-700">
                Add{" "}
                {formatCurrency(
                  shippingCalculation.freeShippingThreshold -
                    cartItems.reduce(
                      (sum, item) =>
                        sum + parseFloat(item.price) * item.quantity,
                      0
                    )
                )}{" "}
                more for free shipping!
              </span>
            </div>
          </div>
        )}

        {/* Shipping breakdown (for development/debugging) */}
        {process.env.NODE_ENV === "development" && shippingCalculation && (
          <details className="mt-4">
            <summary className="text-xs text-secondary-500 cursor-pointer">
              Shipping Calculation Details
            </summary>
            <pre className="text-xs text-secondary-600 mt-2 bg-secondary-50 p-2 rounded">
              {JSON.stringify(shippingCalculation, null, 2)}
            </pre>
          </details>
        )}
      </CardContent>
    </Card>
  );
};

export default ShippingOptions;
