"use client";

import { useState } from "react";
import { X, Copy, Check, Share2 } from "lucide-react";
import {
  WhatsappShareButton,
  WhatsappIcon,
  TwitterShareButton,
  TwitterIcon,
  LinkedinShareButton,
  LinkedinIcon,
  TelegramShareButton,
  TelegramIcon,
  EmailShareButton,
  EmailIcon,
  FacebookShareButton,
  FacebookIcon,
} from "next-share";
import { useLanguage } from "../context/LanguageContext";

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  shareUrl: string;
  title: string;
}

export default function ShareModal({ isOpen, onClose, shareUrl, title }: ShareModalProps) {
  const [copied, setCopied] = useState(false);
  const { t, dir } = useLanguage();

  if (!isOpen) return null;

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4" dir={dir}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-2xl w-full max-w-[95%] sm:max-w-md p-4 sm:p-6 mx-2 sm:mx-4 animate-in fade-in zoom-in duration-200">
        
        <button
          onClick={onClose}
          className="absolute cursor-pointer top-2 right-2 sm:top-4 sm:right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors p-1"
        >
          <X className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>

        <div className="text-center mb-4 sm:mb-6">
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-emerald-600 to-green-600 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-2 sm:mb-3">
            <Share2 className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
          </div>
          <h2 className="text-lg sm:text-2xl font-bold text-gray-800 dark:text-white">{t("share_report") || "Share Report"}</h2>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5 sm:mt-1">
            {t("share_subtitle") || "Share your resume analysis with others"}
          </p>
        </div>

        <div className="mb-4 sm:mb-6">
          <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 sm:mb-2">
            {t("share_link") || "Share Link"}
          </label>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={shareUrl}
              readOnly
              className="flex-1 px-2 sm:px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 truncate"
            />
            <button
              onClick={copyToClipboard}
              className="px-3 sm:px-4 py-2 cursor-pointer bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white rounded-lg transition-all duration-300 flex items-center justify-center gap-1 sm:gap-2 text-sm active:scale-[0.98]"
            >
              {copied ? <Check className="w-3 h-3 sm:w-4 sm:h-4" /> : <Copy className="w-3 h-3 sm:w-4 sm:h-4" />}
              {copied ? (t("copied") || "Copied!") : (t("copy") || "Copy")}
            </button>
          </div>
        </div>

        <div>
          <p className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 sm:mb-3 text-center">
            {t("share_via") || "Share via"}
          </p>
          <div className="flex justify-center flex-wrap gap-3 sm:gap-4">
            <WhatsappShareButton url={shareUrl} title={title}>
              <WhatsappIcon size={40} round />
            </WhatsappShareButton>
            
            <TwitterShareButton url={shareUrl} title={title}>
              <TwitterIcon size={40} round />
            </TwitterShareButton>
            
            <LinkedinShareButton url={shareUrl} title={title}>
              <LinkedinIcon size={40} round />
            </LinkedinShareButton>
            
            <TelegramShareButton url={shareUrl} title={title}>
              <TelegramIcon size={40} round />
            </TelegramShareButton>
            
            <EmailShareButton url={shareUrl} subject={title} body={`Check out my resume analysis:\n\n${shareUrl}`}>
              <EmailIcon size={40} round />
            </EmailShareButton>
            
            <FacebookShareButton url={shareUrl} quote={title}>
              <FacebookIcon size={40} round />
            </FacebookShareButton>
          </div>
        </div>

        <p className="text-center text-[10px] sm:text-xs text-gray-400 dark:text-gray-500 mt-4 sm:mt-6">
          {t("share_note") || "Anyone with the link can view this report"}
        </p>
      </div>
    </div>
  );
}