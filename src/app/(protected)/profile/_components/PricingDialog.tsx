"use client";

import { DialogContent, DialogTitle } from "@/components/ui/dialog";
import { updateCurrentUser } from "@/services/auth";
import { Dialog } from "@radix-ui/react-dialog";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { Check, X } from 'lucide-react';


interface ExportDialogProps {
  onClose: () => void;
  dialogOpen: boolean;
}

const PricingDialog = ({ dialogOpen, onClose }: ExportDialogProps) => {
  const [inputEmail, setInputEmail] = useState("");

  const { mutateAsync: updateUser, isPending } = useMutation({
    mutationFn: updateCurrentUser,
    onSuccess: () => {
      onClose();
    },
    onError: (error) => console.error(error.message)
  })

  const handleUpdate = async () => {
    await updateUser({ email: inputEmail })
  }

  const plans = [
    {
      name: "Free (Starter)",
      price: "$0",
      period: "/forever",
      features: [
        { text: "Generate up to 5 questions/day", included: true },
        { text: "Limited question types (multiple choice only)", included: true },
        { text: "Basic export (CSV only)", included: true },
        { text: "Save question sets in question bank", included: false },
        { text: "Simple AI customization (e.g., difficulty levels, Bloom's taxonomy)", included: false },
        { text: "Email Support", included: false }
      ],
      buttonText: "Already Subscribed",
      isPopular: false
    },
    {
      name: "Pro (Individual Creators / Teachers)",
      price: "$9-15",
      period: "/month",
      features: [
        { text: "Generate up to 500-1,000 questions/month", included: true },
        { text: "Access to all question types (MCQ, true/false, fill-in, short answer)", included: true },
        { text: "Export to PDF, CSV", included: true },
        { text: "Save question sets in question bank", included: true },
        { text: "Simple AI customization (e.g., difficulty levels, Bloom's taxonomy)", included: true },
        { text: "Email Support", included: true }
      ],
      buttonText: "Subscribe",
      isPopular: true
    },
    {
      name: "Team / School Plan",
      price: "$39-99",
      period: "/month (up to 10 team members by tiers)",
      features: [
        { text: "Feature from Pro plus", included: true },
        { text: "Unlimited question generation", included: true },
        { text: "Advanced exports (PDF, CSV, JSON)", included: true },
        { text: "Publish", included: true },
        { text: "Get template to answer the question (PDF)", included: true },
        { text: "Priority support", included: true }
      ],
      buttonText: "Subscribe",
      isPopular: false
    }
  ];
  return <Dialog open={dialogOpen} onOpenChange={onClose}>
    <DialogTitle></DialogTitle>
    <DialogContent className="max-w-6xl w-full rounded-lg">

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-3">

        {plans.map((plan, index) => (

          <div
            key={index}
            className={`
                        group relative bg-white rounded-2xl p-7 transition-all duration-300
                        border-2 border-gray-100 hover:border-purple-500 hover:border-3 transform hover:scale-105 hover:shadow-2xl hover:bg-gradient-to-br hover:from-purple-50 hover:to-cyan-50
                    `}
          >

            <div className=" mb-6">
              <h3 className=" font-semibold mb-2 text-purple-600">{plan.name}</h3>
              <div className="flex items-baseline ">
                <span className="text-3xl font-bold text-gray-900">{plan.price}</span>
                <span className="flex-1 text-sm text-gray-600 ml-1 ">{plan.period}</span>
              </div>
            </div>

            <div className="space-y-3 mb-8">
              {plan.features.map((feature, featureIndex) => (
                <div key={featureIndex} className="flex items-start">
                  <div className="flex-shrink-0 mt-0.5">
                    {feature.included ? (
                      <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <Check className="w-3 h-3 font-bold text-white" />
                      </div>
                    ) : (
                      <div className="w-5 h-5 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
                        <X className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </div>
                  <span className={`ml-3 text-sm ${feature.included ? 'text-gray-700' : 'text-gray-400'}`}>
                    {feature.text}
                  </span>
                </div>
              ))}
            </div>

            <button
              className={`
                      w-full py-3 px-4 text-md rounded-lg font-medium transition-all text-purple-600 duration-200 bg-gray-100 
                      ${plan.buttonText === 'Already Subscribed'
                  ? 'group-hover:bg-gradient-to-r group-hover:from-cyan-400 group-hover:to-purple-600 group-hover:text-white group-hover:opacity-50'
                  : 'group-hover:bg-gradient-to-r group-hover:from-cyan-400 group-hover:to-purple-600 group-hover:text-white'
                }
                      `}
            >
              {plan.buttonText}
            </button>
          </div>
        ))}
      </div>

    </DialogContent>
  </Dialog>
}

export default PricingDialog;