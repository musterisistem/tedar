
import { BrowserRouter as Router, Routes, Route, Outlet, Navigate } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { VisitorTracker } from './components/common/VisitorTracker';
import { ProductProvider } from './context/ProductContext';
import { CategoryProvider } from './context/CategoryContext';
import { UserProvider } from './context/UserContext';
import { SiteProvider } from './context/SiteContext';
import { NotificationProvider } from './context/NotificationContext';
import { PriceAlertProvider } from './context/PriceAlertContext';
import { OrderProvider } from './context/OrderContext';
import { CartProvider } from './context/CartContext';
import { Loading } from './components/common/Loading';
import React, { Suspense } from 'react';

// Lazy Load Pages
const Home = React.lazy(() => import('./pages/Home').then(module => ({ default: module.Home })));
const CategoryPage = React.lazy(() => import('./pages/CategoryPage').then(module => ({ default: module.CategoryPage })));
const SearchPage = React.lazy(() => import('./pages/SearchPage').then(module => ({ default: module.SearchPage })));
const ProductDetail = React.lazy(() => import('./pages/ProductDetail').then(module => ({ default: module.ProductDetail })));
const CartPage = React.lazy(() => import('./pages/CartPage').then(module => ({ default: module.CartPage })));
const CheckoutPage = React.lazy(() => import('./pages/CheckoutPage').then(module => ({ default: module.CheckoutPage })));
const OrderSuccess = React.lazy(() => import('./pages/OrderSuccess').then(module => ({ default: module.OrderSuccess })));
const Login = React.lazy(() => import('./pages/auth/Login').then(module => ({ default: module.Login })));
const Register = React.lazy(() => import('./pages/auth/Register').then(module => ({ default: module.Register })));
const Account = React.lazy(() => import('./pages/account/Account').then(module => ({ default: module.Account })));
const About = React.lazy(() => import('./pages/About').then(module => ({ default: module.About })));
const Contact = React.lazy(() => import('./pages/Contact').then(module => ({ default: module.Contact })));
const ProductCollectionPage = React.lazy(() => import('./pages/ProductCollectionPage').then(module => ({ default: module.ProductCollectionPage })));

// Admin Pages (Lazy)
const AdminLayout = React.lazy(() => import('./components/layout/AdminLayout').then(module => ({ default: module.AdminLayout })));
const AdminLogin = React.lazy(() => import('./pages/admin/AdminLogin').then(module => ({ default: module.AdminLogin })));
const Dashboard = React.lazy(() => import('./pages/admin/Dashboard').then(module => ({ default: module.Dashboard })));
const Orders = React.lazy(() => import('./pages/admin/Orders').then(module => ({ default: module.Orders })));
const AddProduct = React.lazy(() => import('./pages/admin/AddProduct').then(module => ({ default: module.AddProduct })));
const ProductList = React.lazy(() => import('./pages/admin/ProductList').then(module => ({ default: module.ProductList })));
const OrderDetail = React.lazy(() => import('./pages/admin/OrderDetail').then(module => ({ default: module.OrderDetail })));
const UserList = React.lazy(() => import('./pages/admin/UserList').then(module => ({ default: module.UserList })));
const UserDetail = React.lazy(() => import('./pages/admin/UserDetail').then(module => ({ default: module.UserDetail })));
const CategoryManager = React.lazy(() => import('./pages/admin/CategoryManager').then(module => ({ default: module.CategoryManager })));
const CollectionManager = React.lazy(() => import('./pages/admin/CollectionManager').then(module => ({ default: module.CollectionManager })));
const BrandManager = React.lazy(() => import('./pages/admin/BrandManager').then(module => ({ default: module.BrandManager })));
const DiscountInCartManager = React.lazy(() => import('./pages/admin/DiscountInCartManager').then(module => ({ default: module.DiscountInCartManager })));
const PriceAlertManager = React.lazy(() => import('./pages/admin/PriceAlertManager').then(module => ({ default: module.PriceAlertManager })));
const PaymentMethodManager = React.lazy(() => import('./pages/admin/PaymentMethodManager').then(module => ({ default: module.PaymentMethodManager })));
const DeliverySettingsManager = React.lazy(() => import('./pages/admin/DeliverySettingsManager').then(module => ({ default: module.DeliverySettingsManager })));
const PopularCategoryManager = React.lazy(() => import('./pages/admin/PopularCategoryManager').then(module => ({ default: module.PopularCategoryManager })));
const HomeCollectionsManager = React.lazy(() => import('./pages/admin/HomeCollectionsManager').then(module => ({ default: module.HomeCollectionsManager })));
const SliderManager = React.lazy(() => import('./pages/admin/home/SliderManager').then(module => ({ default: module.SliderManager })));
const BannerManager = React.lazy(() => import('./pages/admin/home/BannerManager').then(module => ({ default: module.BannerManager })));
const FreeShippingBannerManager = React.lazy(() => import('./pages/admin/home/FreeShippingBannerManager').then(module => ({ default: module.FreeShippingBannerManager })));
const FeatureBoxManager = React.lazy(() => import('./pages/admin/home/FeatureBoxManager').then(module => ({ default: module.FeatureBoxManager })));
const BulkImport = React.lazy(() => import('./pages/admin/products/BulkImport').then(module => ({ default: module.BulkImport })));
const AboutManager = React.lazy(() => import('./pages/admin/AboutManager').then(module => ({ default: module.AboutManager })));
const ContactManager = React.lazy(() => import('./pages/admin/ContactManager').then(module => ({ default: module.ContactManager })));
const OfficeSupplyManager = React.lazy(() => import('./pages/admin/home/OfficeSupplyManager').then(module => ({ default: module.OfficeSupplyManager })));

const NotificationSettings = React.lazy(() => import('./pages/admin/NotificationSettings').then(module => ({ default: module.NotificationSettings })));
const BulkStockUpdate = React.lazy(() => import('./pages/admin/BulkStockUpdate').then(module => ({ default: module.BulkStockUpdate })));


function App() {
  return (
    <Router>
      <NotificationProvider>
        <PriceAlertProvider>
          <CategoryProvider>
            <UserProvider>
              <ProductProvider>
                <CartProvider>
                  <OrderProvider>
                    <SiteProvider>
                      <Suspense fallback={<Loading />}>
                        <Routes>
                          {/* Admin Routes */}
                          <Route path="/admin" element={<AdminLogin />} />
                          <Route element={<AdminLayout />}>
                            <Route path="/admin/dashboard" element={<Dashboard />} />
                            <Route path="/admin/orders" element={<Orders />} />
                            <Route path="/admin/products/add" element={<AddProduct />} />
                            <Route path="/admin/products/import" element={<BulkImport />} />
                            <Route path="/admin/products/edit/:id" element={<AddProduct />} />
                            <Route path="/admin/products/list" element={<ProductList />} />
                            <Route path="/admin/orders/:id" element={<OrderDetail />} />
                            <Route path="/admin/users" element={<UserList />} />
                            <Route path="/admin/users/edit/:id" element={<UserDetail />} />
                            <Route path="/admin/categories" element={<CategoryManager />} />
                            <Route path="/admin/products/outlet" element={<CollectionManager type="outlet" />} />
                            <Route path="/admin/products/campaigns" element={<CollectionManager type="campaign" />} />
                            <Route path="/admin/products/flash" element={<CollectionManager type="flash" />} />
                            <Route path="/admin/brands" element={<BrandManager />} />
                            <Route path="/admin/products/discount-in-cart" element={<DiscountInCartManager />} />
                            <Route path="/admin/products/stock-update" element={<BulkStockUpdate />} />
                            <Route path="/admin/price-alerts" element={<PriceAlertManager />} />
                            <Route path="/admin/settings/payments" element={<PaymentMethodManager />} />
                            <Route path="/admin/settings/delivery" element={<DeliverySettingsManager />} />
                            <Route path="/admin/home/popular-categories" element={<PopularCategoryManager />} />
                            <Route path="/admin/settings/office" element={<OfficeSupplyManager />} />
                            <Route path="/admin/settings/about" element={<AboutManager />} />
                            <Route path="/admin/settings/contact" element={<ContactManager />} />
                            <Route path="/admin/settings/notifications" element={<NotificationSettings />} />
                            <Route path="/admin/home/collections" element={<HomeCollectionsManager />} />
                            <Route path="/admin/home/slider" element={<SliderManager />} />
                            <Route path="/admin/home/banners" element={<BannerManager />} />
                            <Route path="/admin/home/free-shipping-banner" element={<FreeShippingBannerManager />} />
                            <Route path="/admin/home/features" element={<FeatureBoxManager />} />
                          </Route>

                          {/* Main Site Routes */}
                          <Route
                            element={
                              <Layout>
                                <VisitorTracker />
                                <Outlet />
                              </Layout>
                            }
                          >
                            <Route path="/" element={<Home />} />
                            <Route path="/kategori/:slug" element={<CategoryPage />} />
                            <Route path="/kategori/:slug/:subSlug" element={<CategoryPage />} />
                            <Route path="/ara" element={<SearchPage />} />
                            <Route path="/sepet" element={<CartPage />} />
                            <Route path="/odeme" element={<CheckoutPage />} />
                            <Route path="/checkout" element={<Navigate to="/odeme" replace />} />
                            <Route path="/siparis-basarili" element={<OrderSuccess />} />
                            <Route path="/giris" element={<Login />} />
                            <Route path="/kayit" element={<Register />} />
                            <Route path="/hesabim" element={<Account />} />
                            <Route path="/account" element={<Navigate to="/hesabim" replace />} />
                            <Route path="/account" element={<Navigate to="/hesabim" replace />} />
                            <Route path="/hakkimizda" element={<About />} />
                            <Route path="/iletisim" element={<Contact />} />
                            <Route path="/support" element={<Navigate to="/iletisim" replace />} />
                            <Route path="/outlet" element={<ProductCollectionPage type="outlet" />} />
                            <Route path="/kampanyalar" element={<ProductCollectionPage type="campaign" />} />
                            <Route path="/ayni-gun-kargo" element={<ProductCollectionPage type="same-day-shipping" />} />
                            <Route path="/siparis-takip" element={<OrderSuccess />} /> {/* Assuming tracking uses similar or specific page, but previously distinct routes? Re-checking context: originally it wasn't a separate route in App.tsx list I saw? Ah, line 150 in Header linked to /track-order. I need to add/update it if it existed or map it. Original App.tsx didn't show /track-order route? Let's check original. */}
                            {/* Product Catch-all Route - Must be last */}
                            <Route path="/:slug" element={<ProductDetail />} />
                          </Route>
                        </Routes>
                      </Suspense>
                    </SiteProvider>
                  </OrderProvider>
                </CartProvider>
              </ProductProvider>
            </UserProvider>
          </CategoryProvider>
        </PriceAlertProvider>
      </NotificationProvider>
    </Router>
  );
}

export default App;
