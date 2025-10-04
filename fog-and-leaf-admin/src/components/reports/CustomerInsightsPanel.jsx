import {
  Users,
  UserPlus,
  UserCheck,
  TrendingUp,
  DollarSign,
  ShoppingCart,
  Calendar,
  Award,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";

const CustomerInsightsPanel = ({ customers, title = "Customer Insights" }) => {
  if (!customers) {
    return (
      <div className="card">
        <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
          <Users className="w-5 h-5" />
          {title}
        </h3>
        <div className="text-center py-12 text-secondary-500">
          <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>No customer data available</p>
          <p className="text-sm">
            Customer analytics will appear here once orders are placed
          </p>
        </div>
      </div>
    );
  }

  const {
    topSpenders = [],
    newCustomers = 0,
    returningCustomers = 0,
    retentionRate = 0,
    avgOrderValue = 0,
  } = customers;

  return (
    <div className="card">
      <h3 className="text-lg font-medium mb-6 flex items-center gap-2">
        <Users className="w-5 h-5" />
        {title}
      </h3>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Customer Metrics */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-secondary-700 mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Key Metrics
          </h4>

          <div className="grid grid-cols-2 gap-3">
            {/* New Customers */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <UserPlus className="w-4 h-4 text-blue-600" />
                <span className="text-xs font-medium text-blue-800">New</span>
              </div>
              <div className="text-lg font-bold text-blue-900">
                {newCustomers}
              </div>
              <div className="text-xs text-blue-600">customers</div>
            </div>

            {/* Returning Customers */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <UserCheck className="w-4 h-4 text-green-600" />
                <span className="text-xs font-medium text-green-800">
                  Returning
                </span>
              </div>
              <div className="text-lg font-bold text-green-900">
                {returningCustomers}
              </div>
              <div className="text-xs text-green-600">customers</div>
            </div>

            {/* Retention Rate */}
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="w-4 h-4 text-purple-600" />
                <span className="text-xs font-medium text-purple-800">
                  Retention
                </span>
              </div>
              <div className="text-lg font-bold text-purple-900">
                {retentionRate.toFixed(1)}%
              </div>
              <div className="text-xs text-purple-600">rate</div>
            </div>

            {/* Average Order Value */}
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <DollarSign className="w-4 h-4 text-orange-600" />
                <span className="text-xs font-medium text-orange-800">AOV</span>
              </div>
              <div className="text-lg font-bold text-orange-900">
                ${parseFloat(avgOrderValue).toFixed(2)}
              </div>
              <div className="text-xs text-orange-600">average</div>
            </div>
          </div>

          {/* Customer Acquisition Breakdown */}
          <div className="bg-secondary-50 rounded-lg p-4">
            <h5 className="text-sm font-medium text-secondary-700 mb-3">
              Customer Acquisition
            </h5>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-secondary-600">Total Active</span>
                <span className="font-medium">
                  {newCustomers + returningCustomers}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-secondary-600">
                  New vs Returning
                </span>
                <span className="font-medium">
                  {newCustomers + returningCustomers > 0
                    ? `${(
                        (newCustomers / (newCustomers + returningCustomers)) *
                        100
                      ).toFixed(0)}% : ${(
                        (returningCustomers /
                          (newCustomers + returningCustomers)) *
                        100
                      ).toFixed(0)}%`
                    : "0% : 0%"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Top Customers */}
        <div>
          <h4 className="text-sm font-medium text-secondary-700 mb-4 flex items-center gap-2">
            <Award className="w-4 h-4" />
            Top Customers by Spending
          </h4>

          {topSpenders && topSpenders.length > 0 ? (
            <div className="space-y-3">
              {topSpenders.slice(0, 5).map((customer, index) => {
                const totalSpent = parseFloat(
                  customer.totalSpent || customer.dataValues?.totalSpent || 0
                );
                const orderCount = parseInt(
                  customer.orderCount || customer.dataValues?.orderCount || 0
                );
                const avgOrderValue =
                  orderCount > 0 ? totalSpent / orderCount : 0;

                return (
                  <div
                    key={customer.id}
                    className="flex items-center justify-between p-3 bg-white border rounded-lg hover:shadow-sm transition-shadow"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-secondary-100">
                        <span className="text-sm font-bold text-secondary-700">
                          #{index + 1}
                        </span>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-secondary-900">
                          {customer.firstname} {customer.lastname}
                        </div>
                        <div className="text-xs text-secondary-500">
                          {customer.email}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-sm font-bold text-green-600">
                        ${totalSpent.toFixed(2)}
                      </div>
                      <div className="text-xs text-secondary-500">
                        {orderCount} orders • ${avgOrderValue.toFixed(2)} avg
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-secondary-500">
              <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No customer spending data available</p>
            </div>
          )}

          {/* Customer Summary */}
          {topSpenders && topSpenders.length > 0 && (
            <div className="mt-6 pt-4 border-t border-secondary-200">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-sm font-bold text-secondary-900">
                    $
                    {topSpenders
                      .reduce(
                        (sum, c) =>
                          sum +
                          parseFloat(
                            c.totalSpent || c.dataValues?.totalSpent || 0
                          ),
                        0
                      )
                      .toFixed(2)}
                  </div>
                  <div className="text-xs text-secondary-600">
                    Total Revenue
                  </div>
                </div>
                <div>
                  <div className="text-sm font-bold text-secondary-900">
                    {topSpenders.reduce(
                      (sum, c) =>
                        sum +
                        parseInt(c.orderCount || c.dataValues?.orderCount || 0),
                      0
                    )}
                  </div>
                  <div className="text-xs text-secondary-600">Total Orders</div>
                </div>
                <div>
                  <div className="text-sm font-bold text-secondary-900">
                    $
                    {topSpenders.length > 0
                      ? (
                          topSpenders.reduce((sum, c) => {
                            const spent = parseFloat(
                              c.totalSpent || c.dataValues?.totalSpent || 0
                            );
                            const orders = parseInt(
                              c.orderCount || c.dataValues?.orderCount || 0
                            );
                            return sum + (orders > 0 ? spent / orders : 0);
                          }, 0) / topSpenders.length
                        ).toFixed(2)
                      : "0.00"}
                  </div>
                  <div className="text-xs text-secondary-600">
                    Avg Order Value
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomerInsightsPanel;
