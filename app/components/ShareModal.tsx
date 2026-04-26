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
    <div className="fixed inset-0 z-50 flex items-center justify-center" dir={dir}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      
      {/* Modal */}
      <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md p-6 mx-4 animate-in fade-in zoom-in duration-200">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute cursor-pointer top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-r from-emerald-600 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <Share2 className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">{t("share_report") || "Share Report"}</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {t("share_subtitle") || "Share your resume analysis with others"}
          </p>
        </div>

        {/* Share URL */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t("share_link") || "Share Link"}
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={shareUrl}
              readOnly
              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <button
              onClick={copyToClipboard}
              className="px-4 py-2 cursor-pointer bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white rounded-lg transition-all duration-300 flex items-center gap-2"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? (t("copied") || "Copied!") : (t("copy") || "Copy")}
            </button>
          </div>
        </div>

        {/* Share via Apps */}
        <div>
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 text-center">
            {t("share_via") || "Share via"}
          </p>
          <div className="flex justify-center gap-4 flex-wrap">
            <WhatsappShareButton url={shareUrl} title={title}>
              <WhatsappIcon size={48} round />
            </WhatsappShareButton>
            
            <TwitterShareButton url={shareUrl} title={title}>
              <TwitterIcon size={48} round />
            </TwitterShareButton>
            
            <LinkedinShareButton url={shareUrl} title={title}>
              <LinkedinIcon size={48} round />
            </LinkedinShareButton>
            
            <TelegramShareButton url={shareUrl} title={title}>
              <TelegramIcon size={48} round />
            </TelegramShareButton>
            
            <EmailShareButton url={shareUrl} subject={title} body={`Check out my resume analysis:\n\n${shareUrl}`}>
              <EmailIcon size={48} round />
            </EmailShareButton>
            
            <FacebookShareButton url={shareUrl} quote={title}>
              <FacebookIcon size={48} round />
            </FacebookShareButton>
          </div>
        </div>

        {/* Note */}
        <p className="text-center text-xs text-gray-400 dark:text-gray-500 mt-6">
          {t("share_note") || "Anyone with the link can view this report"}
        </p>
      </div>
    </div>
  );
}