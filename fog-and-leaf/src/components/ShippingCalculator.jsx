import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Truck, Clock, MapPin, Package, Info } from "lucide-react";
import {
  calculateShippingCost,
  getDeliveryOptions,
  estimateDeliveryDate,
} from "../utility/shippingCalculator";

const ShippingCalculator = ({
  cartItems,
  shippingAddress,
  selectedSpeed = "standard",
  onShippingChange,
  onSpeedChange,
}) => {
  const [shippingInfo, setShippingInfo] = useState({
    cost: 0,
    breakdown: {},
    zone: null,
    weight: 0,
    deliveryDays: "N/A",
    freeShippingThreshold: 1000,
    isFreeShipping: false,
  });
  const [deliveryOptions, setDeliveryOptions] = useState([]);

  useEffect(() => {
    if (cartItems && cartItems.length > 0) {
      const info = calculateShippingCost(
        cartItems,
        shippingAddress,
        selectedSpeed
      );
      setShippingInfo(info);

      const options = getDeliveryOptions(cartItems, shippingAddress);
      setDeliveryOptions(options);

      // Notify parent component about shipping cost change
      if (onShippingChange) {
        onShippingChange(info);
      }
    }
  }, [cartItems, shippingAddress, selectedSpeed, onShippingChange]);

  const handleSpeedChange = (speed) => {
    if (onSpeedChange) {
      onSpeedChange(speed);
    }
  };

  const formatCurrency = (amount) => `₹${parseFloat(amount).toFixed(2)}`;

  const cartSubtotal =
    cartItems?.reduce(
      (sum, item) => sum + parseFloat(item.price) * item.quantity,
      0
    ) || 0;
  const remainingForFreeShipping = Math.max(
    0,
    shippingInfo.freeShippingThreshold - cartSubtotal
  );

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Truck className="h-5 w-5" />
          Shipping Options
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Free Shipping Progress */}
        {!shippingInfo.isFreeShipping && remainingForFreeShipping > 0 && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <Info className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-green-800">
                Add {formatCurrency(remainingForFreeShipping)} more for FREE
                shipping!
              </span>
            </div>
            <div className="w-full bg-green-200 rounded-full h-2">
              <div
                className="bg-green-600 h-2 rounded-full transition-all duration-300"
                style={{
                  width: `${Math.min(
                    100,
                    (cartSubtotal / shippingInfo.freeShippingThreshold) * 100
                  )}%`,
                }}
              ></div>
            </div>
          </div>
        )}

        {/* Current Shipping Info */}
        {shippingAddress?.city && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">
                Delivering to {shippingAddress.city}, {shippingAddress.state}
              </span>
            </div>
            <div className="text-xs text-blue-600">
              Zone: {shippingInfo.zone} • Weight: {shippingInfo.weight}kg
            </div>
          </div>
        )}

        {/* Delivery Speed Options */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Choose Delivery Speed:</Label>
          {deliveryOptions.map((option) => (
            <div key={option.id}>
              <label className="flex items-center justify-between p-3 border border-secondary-200 rounded-lg cursor-pointer hover:bg-secondary-50 transition-colors">
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="deliverySpeed"
                    value={option.id}
                    checked={selectedSpeed === option.id}
                    onChange={() => handleSpeedChange(option.id)}
                    className="text-primary-600 focus:ring-primary-500"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{option.icon}</span>
                      <span className="font-medium text-secondary-900">
                        {option.name}
                      </span>
                      {option.cost === 0 && (
                        <Badge className="bg-green-100 text-green-800 text-xs">
                          FREE
                        </Badge>
                      )}
                    </div>
                    <div className="text-sm text-secondary-600 flex items-center gap-1 mt-1">
                      <Clock className="h-3 w-3" />
                      {option.description}
                    </div>
                    {option.id === selectedSpeed && (
                      <div className="text-xs text-blue-600 mt-1">
                        Estimated delivery:{" "}
                        {estimateDeliveryDate(option.deliveryDays)}
                      </div>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-secondary-900">
                    {option.cost === 0 ? "FREE" : formatCurrency(option.cost)}
                  </div>
                  {option.deliveryDays && (
                    <div className="text-xs text-secondary-500">
                      {option.deliveryDays} days
                    </div>
                  )}
                </div>
              </label>
            </div>
          ))}
        </div>

        {/* Shipping Cost Breakdown */}
        {selectedSpeed &&
          shippingInfo.breakdown &&
          !shippingInfo.isFreeShipping && (
            <div className="bg-secondary-50 border border-secondary-200 rounded-lg p-3">
              <div className="text-sm font-medium text-secondary-900 mb-2 flex items-center gap-2">
                <Package className="h-4 w-4" />
                Shipping Cost Breakdown
              </div>
              <div className="space-y-1 text-xs text-secondary-600">
                <div className="flex justify-between">
                  <span>Base shipping cost:</span>
                  <span>{formatCurrency(shippingInfo.breakdown.baseCost)}</span>
                </div>
                {shippingInfo.breakdown.weightCost > 0 && (
                  <div className="flex justify-between">
                    <span>Weight charges ({shippingInfo.weight}kg):</span>
                    <span>
                      {formatCurrency(shippingInfo.breakdown.weightCost)}
                    </span>
                  </div>
                )}
                {shippingInfo.breakdown.speedMultiplier !== 1 && (
                  <div className="flex justify-between">
                    <span>
                      Speed multiplier ({shippingInfo.breakdown.speedMultiplier}
                      x):
                    </span>
                    <span>
                      +
                      {formatCurrency(
                        shippingInfo.breakdown.originalCost -
                          (shippingInfo.breakdown.baseCost +
                            shippingInfo.breakdown.weightCost)
                      )}
                    </span>
                  </div>
                )}
                <hr className="border-secondary-300" />
                <div className="flex justify-between font-medium text-secondary-900">
                  <span>Total shipping:</span>
                  <span>
                    {formatCurrency(shippingInfo.breakdown.finalCost)}
                  </span>
                </div>
              </div>
            </div>
          )}

        {/* Free Shipping Badge */}
        {shippingInfo.isFreeShipping && (
          <div className="bg-green-100 border border-green-300 rounded-lg p-3 text-center">
            <div className="text-green-800 font-semibold flex items-center justify-center gap-2">
              <Truck className="h-4 w-4" />
              🎉 Congratulations! You qualify for FREE shipping
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ShippingCalculator;
