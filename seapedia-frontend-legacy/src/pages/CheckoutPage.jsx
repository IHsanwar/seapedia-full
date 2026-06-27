import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCart } from "@/api/cart";
import { getAddresses } from "@/api/addresses";
import { checkout, applyVoucher } from "@/api/orders";
import { getAvailableVouchers } from "@/api/vouchers";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tag,
  Truck,
  MapPin,
  ChevronRight,
  Check,
  X,
  Ticket,
  Percent,
} from "lucide-react";
import { toast } from "sonner";

const DELIVERY_METHODS = [
  { value: "instant", label: "Instant (2 hours)", price: 15000 },
  { value: "next_day", label: "Next Day", price: 10000 },
  { value: "regular", label: "Regular (3-5 days)", price: 5000 },
];

export default function CheckoutPage() {
  const navigate = useNavigate();
  const [cart, setCart] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form states
  const [selectedAddress, setSelectedAddress] = useState("");
  const [deliveryMethod, setDeliveryMethod] = useState("regular");
  const [voucherCode, setVoucherCode] = useState("");
  const [appliedVoucher, setAppliedVoucher] = useState(null);
  const [discount, setDiscount] = useState(0);
  const [voucherDialogOpen, setVoucherDialogOpen] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [cartRes, addressesRes, vouchersRes] = await Promise.all([
        getCart(),
        getAddresses(),
        getAvailableVouchers().catch(() => ({ data: [] })),
      ]);

      setCart(cartRes.data);
      setAddresses(addressesRes.data || []);
      setVouchers(vouchersRes.data || []);

      // Set default address
      const defaultAddress = addressesRes.data?.find((a) => a.is_default);
      if (defaultAddress) {
        setSelectedAddress(defaultAddress.id.toString());
      } else if (addressesRes.data?.length > 0) {
        setSelectedAddress(addressesRes.data[0].id.toString());
      }
    } catch (error) {
      toast.error("Failed to load checkout data");
    } finally {
      setLoading(false);
    }
  };

  const handleApplyVoucher = async () => {
    if (!voucherCode.trim()) {
      toast.error("Please enter a voucher code");
      return;
    }

    if (!cart?.subtotal) {
      toast.error("Cart is empty");
      return;
    }

    try {
      const response = await applyVoucher({
        voucher_code: voucherCode.trim(),
        subtotal: cart.subtotal,
      });

      const { voucher, discount: discountAmount } = response.data;
      setAppliedVoucher(voucher);
      setDiscount(discountAmount);
      toast.success(`Voucher applied! You saved Rp ${discountAmount.toLocaleString("id-ID")}`);
    } catch (error) {
      const message = error.response?.data?.message || "Failed to apply voucher";
      toast.error(message);
      setAppliedVoucher(null);
      setDiscount(0);
    }
  };

  const handleSelectVoucher = (voucher) => {
    setVoucherCode(voucher.code);
    setVoucherDialogOpen(false);
    // Auto apply the selected voucher
    setTimeout(() => {
      handleApplyVoucher();
    }, 100);
  };

  const handleRemoveVoucher = () => {
    setAppliedVoucher(null);
    setDiscount(0);
    setVoucherCode("");
    toast.info("Voucher removed");
  };

  const handleSubmit = async () => {
    if (!selectedAddress) {
      toast.error("Please select a delivery address");
      return;
    }

    if (!deliveryMethod) {
      toast.error("Please select a delivery method");
      return;
    }

    try {
      setSubmitting(true);
      const orderData = {
        address_id: parseInt(selectedAddress),
        delivery_method: deliveryMethod,
      };

      // Add voucher code if applied
      if (appliedVoucher) {
        orderData.voucher_code = appliedVoucher.code;
      }

      const response = await checkout(orderData);
      toast.success("Order placed successfully!");
      navigate("/orders");
    } catch (error) {
      const message = error.response?.data?.message || "Failed to place order";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const getDeliveryFee = () => {
    const method = DELIVERY_METHODS.find((m) => m.value === deliveryMethod);
    return method?.price || 0;
  };

  const getSubtotal = () => cart?.subtotal || 0;
  const getDeliveryCost = () => getDeliveryFee();
  const getTax = () => getSubtotal() * 0.12;
  const getTotal = () => getSubtotal() + getDeliveryCost() + getTax() - discount;

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">Loading checkout...</div>
      </div>
    );
  }

  if (!cart?.items?.length) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold mb-2">Your cart is empty</h2>
          <p className="text-gray-500 mb-4">Add some products to proceed with checkout</p>
          <Button onClick={() => navigate("/products")}>Browse Products</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Delivery & Payment */}
        <div className="lg:col-span-2 space-y-6">
          {/* Delivery Address */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Delivery Address
              </CardTitle>
            </CardHeader>
            <CardContent>
              {addresses.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-gray-500 mb-4">No addresses found</p>
                  <Button onClick={() => navigate("/addresses")} variant="outline">
                    Add Address
                  </Button>
                </div>
              ) : (
                <RadioGroup
                  value={selectedAddress}
                  onValueChange={setSelectedAddress}
                  className="space-y-3"
                >
                  {addresses.map((address) => (
                    <div
                      key={address.id}
                      className={`flex items-start space-x-3 border rounded-lg p-4 cursor-pointer transition-colors ${
                        selectedAddress === address.id.toString()
                          ? "border-primary bg-primary/5"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                      onClick={() => setSelectedAddress(address.id.toString())}
                    >
                      <RadioGroupItem
                        value={address.id.toString()}
                        id={`address-${address.id}`}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{address.label}</span>
                          {address.is_default && (
                            <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">
                              Default
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{address.full_address}</p>
                        <p className="text-sm text-gray-500">
                          {address.city}, {address.postal_code}
                        </p>
                        <p className="text-sm text-gray-500">{address.phone}</p>
                      </div>
                    </div>
                  ))}
                </RadioGroup>
              )}
            </CardContent>
          </Card>

          {/* Delivery Method */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck className="h-5 w-5" />
                Delivery Method
              </CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup
                value={deliveryMethod}
                onValueChange={setDeliveryMethod}
                className="space-y-3"
              >
                {DELIVERY_METHODS.map((method) => (
                  <div
                    key={method.value}
                    className={`flex items-center justify-between border rounded-lg p-4 cursor-pointer transition-colors ${
                      deliveryMethod === method.value
                        ? "border-primary bg-primary/5"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                    onClick={() => setDeliveryMethod(method.value)}
                  >
                    <div className="flex items-center gap-3">
                      <RadioGroupItem value={method.value} id={method.value} />
                      <div>
                        <p className="font-medium">{method.label}</p>
                      </div>
                    </div>
                    <span className="font-medium">
                      Rp {method.price.toLocaleString("id-ID")}
                    </span>
                  </div>
                ))}
              </RadioGroup>
            </CardContent>
          </Card>

          {/* Voucher Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Tag className="h-5 w-5" />
                Voucher
              </CardTitle>
            </CardHeader>
            <CardContent>
              {appliedVoucher ? (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="bg-green-100 p-2 rounded-full">
                        <Check className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium text-green-800">
                          {appliedVoucher.code}
                        </p>
                        <p className="text-sm text-green-600">
                          Saved Rp {discount.toLocaleString("id-ID")}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleRemoveVoucher}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Enter voucher code"
                      value={voucherCode}
                      onChange={(e) => setVoucherCode(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleApplyVoucher();
                        }
                      }}
                    />
                    <Button
                      onClick={handleApplyVoucher}
                      disabled={!voucherCode.trim()}
                    >
                      Apply
                    </Button>
                  </div>

                  {/* Available Vouchers Dialog */}
                  <Dialog
                    open={voucherDialogOpen}
                    onOpenChange={setVoucherDialogOpen}
                  >
                    <DialogTrigger asChild>
                      <Button variant="outline" className="w-full">
                        <Ticket className="h-4 w-4 mr-2" />
                        Browse Available Vouchers
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Available Vouchers</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-3 mt-4">
                        {vouchers.length === 0 ? (
                          <p className="text-center text-gray-500 py-4">
                            No available vouchers
                          </p>
                        ) : (
                          vouchers.map((voucher) => (
                            <div
                              key={voucher.id}
                              className="border rounded-lg p-4 cursor-pointer hover:border-primary transition-colors"
                              onClick={() => handleSelectVoucher(voucher)}
                            >
                              <div className="flex items-start justify-between">
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="font-bold text-lg">
                                      {voucher.code}
                                    </span>
                                    {voucher.type === "percent" ? (
                                      <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded flex items-center">
                                        <Percent className="h-3 w-3 mr-1" />
                                        {voucher.value}%
                                      </span>
                                    ) : (
                                      <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded">
                                        Rp{" "}
                                        {Number(
                                          voucher.value
                                        ).toLocaleString("id-ID")}{" "}
                                        OFF
                                      </span>
                                    )}
                                  </div>
                                  {voucher.minimum_purchase > 0 && (
                                    <p className="text-sm text-gray-500 mt-1">
                                      Min. purchase: Rp{" "}
                                      {Number(
                                        voucher.minimum_purchase
                                      ).toLocaleString("id-ID")}
                                    </p>
                                  )}
                                  {voucher.max_discount > 0 && (
                                    <p className="text-sm text-gray-500">
                                      Max discount: Rp{" "}
                                      {Number(
                                        voucher.max_discount
                                      ).toLocaleString("id-ID")}
                                    </p>
                                  )}
                                  <p className="text-xs text-gray-400 mt-2">
                                    Expires: {" "}
                                    {new Date(
                                      voucher.expired_at
                                    ).toLocaleDateString("id-ID")}
                                  </p>
                                </div>
                                <ChevronRight className="h-5 w-5 text-gray-400" />
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Order Summary */}
        <div>
          <Card className="sticky top-4">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Cart Items Summary */}
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {cart.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex justify-between text-sm"
                  >
                    <span className="text-gray-600">
                      {item.product?.name} x{item.quantity}
                    </span>
                    <span>
                      Rp{" "}
                      {(
                        item.product?.price * item.quantity
                      ).toLocaleString("id-ID")}
                    </span>
                  </div>
                ))}
              </div>

              <hr />

              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span>Rp {getSubtotal().toLocaleString("id-ID")}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600">Delivery Fee</span>
                <span>Rp {getDeliveryCost().toLocaleString("id-ID")}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600">Tax (12%)</span>
                <span>Rp {getTax().toLocaleString("id-ID")}</span>
              </div>

              {discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount</span>
                  <span>- Rp {discount.toLocaleString("id-ID")}</span>
                </div>
              )}

              <hr />

              <div className="flex justify-between text-lg font-semibold">
                <span>Total</span>
                <span>Rp {getTotal().toLocaleString("id-ID")}</span>
              </div>

              <Button
                className="w-full"
                size="lg"
                onClick={handleSubmit}
                disabled={submitting || !selectedAddress}
              >
                {submitting ? "Processing..." : "Place Order"}
              </Button>

              {!selectedAddress && (
                <p className="text-sm text-red-500 text-center">
                  Please select a delivery address
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
