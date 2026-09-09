import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from '../i18n';
import { VirtualBusinessManager } from '../components/VirtualBusinessManager';
import { enhanceImage } from '../services/imageAIService';
import { authService } from '../services/authService';
import { 
  Sparkles, 
  Camera, 
  DollarSign, 
  Globe, 
  Plus, 
  MapPin, 
  LogOut, 
  CheckCircle2, 
  Sliders, 
  TrendingUp, 
  User,
  HeartHandshake,
  PackageOpen,
  Languages,
  Loader2,
  X,
  Download,
  AlertCircle,
  RefreshCw,
  Tag,
  Box,
  Check,
  Eye,
  Trash2,
  ArrowRight,
  ArrowLeft
} from 'lucide-react';

const blobToBase64 = (blob) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

export const ArtisanDashboardScreen = () => {
  const { user, handleLogout, setCurrentScreen } = useAuth();
  const { t, language, setLanguage, languages } = useTranslation();

  // Modals & UI Navigation State
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [productStep, setProductStep] = useState(1); // 1: Photo Select, 2: AI Processing & Result, 3: Product Details Form

  // Image AI & File Input State
  const fileInputRef = useRef(null);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [processingPhase, setProcessingPhase] = useState(1); // 1: Preparing, 2: Cleaning background, 3: Enhancing details, 4: Almost ready
  const [enhancementError, setEnhancementError] = useState(null);
  const [originalPreviewUrl, setOriginalPreviewUrl] = useState(null);
  const [enhancedResultUrl, setEnhancedResultUrl] = useState(null);
  const [enhancedBlob, setEnhancedBlob] = useState(null);
  const [useOriginalPhoto, setUseOriginalPhoto] = useState(false);
  const [selectedFileMeta, setSelectedFileMeta] = useState(null);
  const [showOriginalToggle, setShowOriginalToggle] = useState(false);

  // Product Form State
  const [productForm, setProductForm] = useState({
    title: '',
    category: user?.categoryName || user?.category || '',
    description: '',
    price: '',
    stock: '1'
  });
  const [isSavingProduct, setIsSavingProduct] = useState(false);
  const [saveProductError, setSaveProductError] = useState(null);

  // Catalog Products State
  const [products, setProducts] = useState([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);

  // Fetch Products on Mount
  const fetchProducts = async () => {
    setIsLoadingProducts(true);
    try {
      const res = await authService.getProducts();
      if (res.success && res.products) {
        setProducts(res.products);
      }
    } catch (err) {
      console.warn('[Fetch Products Error]', err.message);
    } finally {
      setIsLoadingProducts(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Object URL cleanup
  useEffect(() => {
    return () => {
      if (originalPreviewUrl && originalPreviewUrl.startsWith('blob:')) URL.revokeObjectURL(originalPreviewUrl);
      if (enhancedResultUrl && enhancedResultUrl.startsWith('blob:')) URL.revokeObjectURL(enhancedResultUrl);
    };
  }, [originalPreviewUrl, enhancedResultUrl]);

  // Reset Add Product Workflow State
  const resetAddProductFlow = () => {
    if (originalPreviewUrl && originalPreviewUrl.startsWith('blob:')) URL.revokeObjectURL(originalPreviewUrl);
    if (enhancedResultUrl && enhancedResultUrl.startsWith('blob:')) URL.revokeObjectURL(enhancedResultUrl);
    setOriginalPreviewUrl(null);
    setEnhancedResultUrl(null);
    setEnhancedBlob(null);
    setSelectedFileMeta(null);
    setEnhancementError(null);
    setIsEnhancing(false);
    setUseOriginalPhoto(false);
    setShowOriginalToggle(false);
    setProductStep(1);
    setSaveProductError(null);
    setIsSavingProduct(false);
    setProductForm({
      title: '',
      category: user?.categoryName || user?.category || '',
      description: '',
      price: '',
      stock: '1'
    });
    setShowAddProductModal(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Open Add Product Flow
  const openAddProductFlow = () => {
    resetAddProductFlow();
    setShowAddProductModal(true);
    setProductStep(1);
  };

  // Trigger File Input Picker
  const triggerImagePicker = () => {
    if (isEnhancing) return;
    setEnhancementError(null);
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Handle Image File Selection & Auto-Enhance via FastAPI
  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (isEnhancing) return;

    // Reset previous preview URLs
    if (originalPreviewUrl && originalPreviewUrl.startsWith('blob:')) URL.revokeObjectURL(originalPreviewUrl);
    if (enhancedResultUrl && enhancedResultUrl.startsWith('blob:')) URL.revokeObjectURL(enhancedResultUrl);
    setEnhancedResultUrl(null);
    setEnhancedBlob(null);
    setEnhancementError(null);
    setUseOriginalPhoto(false);

    // Create preview URL for original file
    const origUrl = URL.createObjectURL(file);
    setOriginalPreviewUrl(origUrl);
    setSelectedFileMeta({
      name: file.name,
      size: (file.size / 1024).toFixed(1) + ' KB',
      type: file.type
    });

    // Advance to Step 2 (AI Processing & Preview)
    setProductStep(2);
    setIsEnhancing(true);
    setProcessingPhase(1);

    // Simulated progress indicators for artisan feedback
    const t1 = setTimeout(() => setProcessingPhase(2), 700);
    const t2 = setTimeout(() => setProcessingPhase(3), 1600);
    const t3 = setTimeout(() => setProcessingPhase(4), 2500);

    try {
      const result = await enhanceImage(file);
      setEnhancedResultUrl(result.enhancedUrl);
      setEnhancedBlob(result.blob);
    } catch (err) {
      setEnhancementError(err.message || 'Photo enhancement is temporarily unavailable. You can try again.');
    } finally {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      setIsEnhancing(false);
    }
  };

  // Save New Craft Product to Catalog
  const handleSaveProduct = async (e) => {
    e.preventDefault();
    if (!productForm.title.trim()) {
      setSaveProductError('Please enter a product title.');
      return;
    }

    setIsSavingProduct(true);
    setSaveProductError(null);

    try {
      let imageString = '';
      if (enhancedBlob && !useOriginalPhoto) {
        imageString = await blobToBase64(enhancedBlob);
      } else if (originalPreviewUrl) {
        imageString = originalPreviewUrl;
      }

      const payload = {
        title: productForm.title.trim(),
        category: productForm.category.trim() || user?.categoryName || user?.category || 'Handicraft',
        description: productForm.description.trim(),
        price: Number(productForm.price) || 0,
        stock: Number(productForm.stock) || 1,
        images: imageString ? [imageString] : []
      };

      const res = await authService.createProduct(payload);
      if (res.success) {
        await fetchProducts();
        resetAddProductFlow();
      } else {
        setSaveProductError(res.message || 'Failed to add product to catalog.');
      }
    } catch (err) {
      setSaveProductError(err.message || 'Failed to save product to catalog.');
    } finally {
      setIsSavingProduct(false);
    }
  };

  // Delete Product Handler
  const handleDeleteProduct = async (productId) => {
    try {
      await authService.deleteProduct(productId);
      fetchProducts();
    } catch (err) {
      console.warn('[Delete Product Error]', err.message);
    }
  };

  return (
    <div className="min-h-full bg-[#F6F3EE] flex flex-col justify-between animate-fade-in pb-16 text-left relative">
      {/* Hidden File Input for Product Image AI Selection */}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Top Navigation Bar */}
      <div className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200 px-4 py-3 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-terracotta-600 text-white flex items-center justify-center font-bold shadow-sm">
            <HeartHandshake className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-base text-slate-900 leading-tight">
              Kala<span className="text-terracotta-600">Saathi</span>
            </h3>
            <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-1 w-max">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              {t('common.verifiedManager')}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Header Language Dropdown Selector */}
          <div className="relative flex items-center bg-slate-100 hover:bg-slate-200 rounded-xl px-2 py-1 transition-colors">
            <Languages className="w-4 h-4 text-terracotta-600 mr-1 flex-shrink-0" />
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="bg-transparent text-xs font-extrabold text-slate-800 outline-none cursor-pointer pr-1"
            >
              {languages.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.native} ({lang.code.toUpperCase()})
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => setShowProfileModal(true)}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
            title={t('nav.profile')}
          >
            <Sliders className="w-4 h-4" />
          </button>
          <button
            onClick={handleLogout}
            className="p-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 transition-colors cursor-pointer"
            title={t('common.logout')}
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Dashboard Content */}
      <div className="p-4 sm:p-6 space-y-6">
        {/* Artisan Hero Banner */}
        <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-br from-terracotta-700 via-terracotta-800 to-slate-900 text-white shadow-floating relative overflow-hidden">
          <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 opacity-10 pointer-events-none">
            <Sparkles className="w-48 h-48" />
          </div>

          <div className="flex items-center gap-4 relative z-10">
            <div className="w-16 h-16 rounded-full border-2 border-amber-300 shadow-md overflow-hidden bg-slate-700 flex-shrink-0">
              {user?.profilePic ? (
                <img src={user.profilePic} alt={user.fullName} className="w-full h-full object-cover" />
              ) : (
                <User className="w-full h-full p-3 text-slate-300" />
              )}
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-1.5">
                <h2 className="font-extrabold text-lg sm:text-xl text-white">
                  {user?.businessName || user?.fullName || t('dashboard.artisanUser')}
                </h2>
                <CheckCircle2 className="w-4 h-4 text-emerald-400 fill-emerald-400/20" />
              </div>
              <p className="text-xs text-terracotta-200 font-medium">
                {user?.categoryName || user?.category || t('dashboard.categoryNotSet')}
              </p>
              <div className="flex items-center gap-2 text-[11px] text-slate-300 pt-0.5">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-amber-300" />
                  {user?.location || t('dashboard.locationNotSet')}
                </span>
                <span>•</span>
                <span>{user?.experience ? `${user.experience}` : t('dashboard.experienceNotSet')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Primary Action CTA — Digitize New Craft Item */}
        <div className="flex items-center justify-between bg-gradient-to-r from-amber-500/15 via-amber-500/10 to-purple-500/10 border border-amber-500/30 p-4 rounded-3xl shadow-xs">
          <div className="flex items-center gap-3.5">
            <div className="p-3 rounded-2xl bg-amber-500 text-white shadow-md">
              <Camera className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-extrabold text-base text-slate-900 leading-tight">{t('dashboard.digitizeCraft')}</h4>
              <p className="text-xs text-slate-600 pt-0.5">{t('dashboard.digitizeDesc')}</p>
            </div>
          </div>
          <button
            onClick={openAddProductFlow}
            className="p-3 rounded-2xl bg-slate-900 text-white hover:bg-slate-800 transition-all shadow-md cursor-pointer flex items-center justify-center gap-1"
            title={t('dashboard.digitizeCraft')}
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>


        {/* Virtual Business Manager Section */}
        <VirtualBusinessManager />

        {/* Product Catalog Section */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-base text-slate-900">{t('dashboard.yourProductCatalog')}</h3>
            <span className="text-xs font-bold text-slate-500">
              {products.length} {products.length === 1 ? 'Product' : 'Products'}
            </span>
          </div>

          {isLoadingProducts ? (
            <div className="p-6 text-center text-slate-400 space-y-2">
              <Loader2 className="w-6 h-6 animate-spin mx-auto text-terracotta-600" />
              <p className="text-xs">Loading craft products...</p>
            </div>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {products.map((prod) => (
                <div key={prod.product_id || prod._id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-soft flex flex-col justify-between">
                  <div className="aspect-square bg-slate-100 relative overflow-hidden">
                    {prod.images && prod.images[0] ? (
                      <img src={prod.images[0]} alt={prod.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-300">
                        <PackageOpen className="w-8 h-8" />
                      </div>
                    )}
                    <span className="absolute top-2 right-2 text-[10px] font-extrabold bg-emerald-500 text-white px-2 py-0.5 rounded-full shadow-xs">
                      AI Enhanced
                    </span>
                  </div>

                  <div className="p-3 space-y-1.5 flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="font-extrabold text-sm text-slate-900 line-clamp-1">{prod.title}</h4>
                      <p className="text-[11px] text-slate-500">{prod.category || 'Handicraft'}</p>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                      <span className="font-black text-sm text-slate-900">₹{prod.price}</span>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded-md">
                          Qty: {prod.stock || 1}
                        </span>
                        <button
                          onClick={() => handleDeleteProduct(prod.product_id)}
                          className="text-red-400 hover:text-red-600 p-1 transition"
                          title="Delete Product"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 rounded-2xl bg-white border border-dashed border-slate-300 text-center space-y-2">
              <PackageOpen className="w-10 h-10 text-slate-300 mx-auto" />
              <h4 className="font-bold text-sm text-slate-800">{t('dashboard.noProducts')}</h4>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                {t('dashboard.noProductsDesc')}
              </p>
              <button
                onClick={openAddProductFlow}
                className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 bg-terracotta-600 hover:bg-terracotta-700 text-white font-bold text-xs rounded-xl shadow-xs transition cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add First Craft Product</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Add Product / Digitize Craft Step-by-Step Modal Overlay */}
      {showAddProductModal && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-5 max-w-lg w-full space-y-4 shadow-floating animate-pop-in text-left max-h-[92vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-2xl bg-amber-500 text-white shadow-sm">
                  <Camera className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-slate-900">
                    {productStep === 1 && 'Step 1: Select Craft Photo'}
                    {productStep === 2 && 'Step 2: AI Photo Processing'}
                    {productStep === 3 && 'Step 3: Enter Product Details'}
                  </h3>
                  <p className="text-[11px] text-slate-500">KalaSaathi AI Craft Digitization</p>
                </div>
              </div>

              {!isSavingProduct && (
                <button
                  onClick={resetAddProductFlow}
                  className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* STEP 1: Select Craft Photo */}
            {productStep === 1 && (
              <div className="py-6 text-center space-y-4">
                <div
                  onClick={triggerImagePicker}
                  className="border-2 border-dashed border-slate-300 hover:border-terracotta-500 rounded-3xl p-8 bg-slate-50/50 hover:bg-slate-50 transition-all cursor-pointer space-y-3 group"
                >
                  <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center group-hover:scale-105 transition-transform shadow-xs">
                    <Camera className="w-7 h-7" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-base text-slate-900">Take or Select Craft Photo</h4>
                    <p className="text-xs text-slate-500 pt-1 max-w-xs mx-auto">
                      Upload JPEG, PNG or WEBP from mobile camera or gallery. AI automatically removes background and enhances lighting.
                    </p>
                  </div>
                  <button className="px-5 py-2.5 bg-slate-900 text-white font-bold text-xs rounded-2xl shadow-sm cursor-pointer group-hover:bg-terracotta-600 transition-colors">
                    Browse Photo
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: AI Processing & Preview Result */}
            {productStep === 2 && (
              <div className="space-y-4">
                {/* State 2A: Processing Spinner */}
                {isEnhancing && (
                  <div className="py-8 text-center space-y-3">
                    <div className="relative w-16 h-16 mx-auto flex items-center justify-center">
                      <div className="absolute inset-0 rounded-full border-4 border-amber-200 border-t-amber-600 animate-spin" />
                      <Sparkles className="w-6 h-6 text-amber-600" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-base text-slate-900">
                        {processingPhase === 1 && 'Preparing your product photo...'}
                        {processingPhase === 2 && 'Cleaning background...'}
                        {processingPhase === 3 && 'Enhancing image details...'}
                        {processingPhase === 4 && 'Almost ready...'}
                      </h4>
                      <p className="text-xs text-slate-500 max-w-xs mx-auto pt-1">
                        Preparing clean studio background and high-definition details for your e-commerce catalog.
                      </p>
                    </div>
                    {originalPreviewUrl && (
                      <div className="w-24 h-24 mx-auto rounded-2xl overflow-hidden border border-slate-200 shadow-sm opacity-60">
                        <img src={originalPreviewUrl} alt="Uploading" className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>
                )}

                {/* State 2B: Enhancement Error (FastAPI Offline / Failed) */}
                {!isEnhancing && enhancementError && (
                  <div className="py-4 space-y-4">
                    <div className="p-4 rounded-2xl bg-red-50 border border-red-200 flex items-start gap-3 text-red-700">
                      <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                      <div className="space-y-1 text-xs">
                        <h5 className="font-bold text-sm text-red-800">Photo enhancement is temporarily unavailable</h5>
                        <p>{enhancementError}</p>
                      </div>
                    </div>

                    {originalPreviewUrl && (
                      <div className="space-y-1.5 text-center">
                        <span className="text-[11px] font-bold text-slate-500 uppercase">Original Photo Preview</span>
                        <div className="w-32 h-32 mx-auto rounded-2xl bg-slate-100 border border-slate-200 overflow-hidden shadow-inner">
                          <img src={originalPreviewUrl} alt="Original Craft" className="w-full h-full object-contain" />
                        </div>
                      </div>
                    )}

                    <div className="flex gap-2">
                      <button
                        onClick={triggerImagePicker}
                        className="flex-1 py-2.5 rounded-2xl bg-purple-600 text-white font-bold text-xs hover:bg-purple-700 transition cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <RefreshCw className="w-4 h-4" />
                        Try Again
                      </button>
                      <button
                        onClick={() => {
                          setSaveProductError(null);
                          setUseOriginalPhoto(true);
                          setProductStep(3);
                        }}
                        className="flex-1 py-2.5 rounded-2xl bg-slate-800 text-white font-bold text-xs hover:bg-slate-900 transition cursor-pointer"
                      >
                        Continue with Original Photo
                      </button>
                    </div>
                  </div>
                )}

                {/* State 2C: Success Enhanced Result */}
                {!isEnhancing && !enhancementError && (enhancedResultUrl || originalPreviewUrl) && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-800">File: {selectedFileMeta?.name}</span>
                      <span className="text-[11px] bg-emerald-100 text-emerald-800 font-extrabold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                        <Check className="w-3 h-3" /> Photo ready for catalog
                      </span>
                    </div>

                    {/* Image Preview Container */}
                    <div className="aspect-square rounded-2xl bg-slate-900 border-2 border-amber-500 overflow-hidden relative shadow-md">
                      <img
                        src={showOriginalToggle ? originalPreviewUrl : (enhancedResultUrl || originalPreviewUrl)}
                        alt="Product Craft"
                        className="w-full h-full object-contain bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:16px_16px]"
                      />

                      <div className="absolute top-2 right-2 flex items-center gap-1.5">
                        <button
                          onClick={() => setShowOriginalToggle(!showOriginalToggle)}
                          className="px-2.5 py-1 rounded-xl bg-slate-900/80 backdrop-blur-md text-white font-bold text-[10px] hover:bg-slate-900 transition flex items-center gap-1"
                        >
                          <Eye className="w-3 h-3" />
                          {showOriginalToggle ? 'Showing Original' : 'Showing Enhanced'}
                        </button>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-2 border-t border-slate-100">
                      <button
                        onClick={triggerImagePicker}
                        className="py-2.5 px-4 rounded-2xl bg-slate-100 text-slate-800 font-bold text-xs hover:bg-slate-200 transition cursor-pointer"
                      >
                        Retake Photo
                      </button>
                      <button
                        onClick={() => {
                          setSaveProductError(null);
                          setProductStep(3);
                        }}
                        className="flex-1 py-2.5 rounded-2xl bg-terracotta-600 text-white font-bold text-xs hover:bg-terracotta-700 transition cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
                      >
                        <span>Continue to Product Details</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* STEP 3: Product Details Form */}
            {productStep === 3 && (
              <form onSubmit={handleSaveProduct} className="space-y-4">
                {/* Form Image Header Thumbnail */}
                <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-200">
                  <div className="w-16 h-16 rounded-xl bg-slate-900 border border-slate-200 overflow-hidden flex-shrink-0 relative">
                    <img
                      src={useOriginalPhoto ? originalPreviewUrl : (enhancedResultUrl || originalPreviewUrl)}
                      alt="Thumbnail"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] font-extrabold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full inline-block">
                      {useOriginalPhoto ? 'Original Photo' : '✓ AI Enhanced Studio Photo'}
                    </span>
                    <h5 className="font-extrabold text-sm text-slate-900 pt-1 line-clamp-1">
                      {productForm.title || 'Untitled Craft Item'}
                    </h5>
                  </div>
                </div>

                {saveProductError && (
                  <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">
                    {saveProductError}
                  </div>
                )}

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block font-bold text-slate-800 mb-1">
                      Product Name / Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Handmade Clay Terracotta Vase"
                      value={productForm.title}
                      onKeyDown={(e) => { if (e.key === 'Enter') e.preventDefault(); }}
                      onChange={(e) => setProductForm(prev => ({ ...prev, title: e.target.value }))}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-terracotta-600 focus:ring-1 focus:ring-terracotta-600 outline-none text-slate-900 font-semibold"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-800 mb-1">Craft Category</label>
                      <input
                        type="text"
                        placeholder="e.g. Terracotta / Pottery"
                        value={productForm.category}
                        onKeyDown={(e) => { if (e.key === 'Enter') e.preventDefault(); }}
                        onChange={(e) => setProductForm(prev => ({ ...prev, category: e.target.value }))}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-terracotta-600 focus:ring-1 focus:ring-terracotta-600 outline-none text-slate-900 font-semibold"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-800 mb-1">Price (₹ INR)</label>
                      <input
                        type="number"
                        min="0"
                        placeholder="e.g. 1250"
                        value={productForm.price}
                        onKeyDown={(e) => { if (e.key === 'Enter') e.preventDefault(); }}
                        onChange={(e) => setProductForm(prev => ({ ...prev, price: e.target.value }))}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-terracotta-600 focus:ring-1 focus:ring-terracotta-600 outline-none text-slate-900 font-semibold"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-800 mb-1">Available Quantity / Stock</label>
                    <input
                      type="number"
                      min="1"
                      placeholder="1"
                      value={productForm.stock}
                      onKeyDown={(e) => { if (e.key === 'Enter') e.preventDefault(); }}
                      onChange={(e) => setProductForm(prev => ({ ...prev, stock: e.target.value }))}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-terracotta-600 focus:ring-1 focus:ring-terracotta-600 outline-none text-slate-900 font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-800 mb-1">Craft Story / Description</label>
                    <textarea
                      rows="2"
                      placeholder="Describe your craft technique, materials used, family heritage..."
                      value={productForm.description}
                      onChange={(e) => setProductForm(prev => ({ ...prev, description: e.target.value }))}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-terracotta-600 focus:ring-1 focus:ring-terracotta-600 outline-none text-slate-900 font-semibold resize-none"
                    />
                  </div>
                </div>

                <div className="flex gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setProductStep(2)}
                    disabled={isSavingProduct}
                    className="py-2.5 px-4 rounded-2xl bg-slate-100 text-slate-800 font-bold text-xs hover:bg-slate-200 transition cursor-pointer flex items-center gap-1"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={isSavingProduct}
                    className="flex-1 py-2.5 rounded-2xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition cursor-pointer flex items-center justify-center gap-1.5 shadow-md disabled:opacity-50"
                  >
                    {isSavingProduct ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Saving to Catalog...
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4 text-emerald-400" />
                        Add to Catalog
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Profile Settings Modal Overlay */}
      {showProfileModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-floating animate-pop-in text-left">
            <h3 className="font-extrabold text-lg text-slate-900">{t('profile.settingsTitle')}</h3>
            <div className="space-y-2 text-sm text-slate-700">
              <p><strong>{t('profile.name')}:</strong> {user?.fullName || t('common.notProvided')}</p>
              <p><strong>{t('profile.userId')}:</strong> {user?.userId || t('common.notProvided')}</p>
              <p><strong>{t('profile.email')}:</strong> {user?.email || t('common.notProvided')}</p>
              <p><strong>{t('profile.businessName')}:</strong> {user?.businessName || t('common.notProvided')}</p>
              <p><strong>{t('profile.craftCategory')}:</strong> {user?.categoryName || user?.category || t('common.notProvided')}</p>
              <p><strong>{t('profile.location')}:</strong> {user?.location || t('common.notProvided')}</p>
              <p><strong>{t('profile.experience')}:</strong> {user?.experience || t('common.notProvided')}</p>
              <p><strong>{t('profile.language')}:</strong> {user?.language?.toUpperCase() || language.toUpperCase()}</p>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => {
                  setShowProfileModal(false);
                  setCurrentScreen('PROFILE_SETUP');
                }}
                className="flex-1 py-2.5 rounded-2xl bg-terracotta-600 text-white font-bold text-xs hover:bg-terracotta-700 transition cursor-pointer"
              >
                {t('profile.editProfile')}
              </button>
              <button
                onClick={() => setShowProfileModal(false)}
                className="flex-1 py-2.5 rounded-2xl bg-slate-100 text-slate-800 font-bold text-xs hover:bg-slate-200 transition cursor-pointer"
              >
                {t('common.close')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
