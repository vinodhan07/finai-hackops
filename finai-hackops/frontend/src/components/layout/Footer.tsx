
import React from "react";
import { Link } from "react-router-dom";
import { Wallet, Github, Twitter, Mail } from "lucide-react";

const Footer = () => {
    return (
        <footer className="w-full bg-card border-t border-border mt-auto">
            <div className="max-w-7xl mx-auto px-4 py-12 md:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Brand Section */}
                    <div className="space-y-4 col-span-1 md:col-span-1">
                        <div className="flex items-center space-x-3">
                            <img
                                src="/lovable-uploads/8eaa0ed2-ead7-405f-ba7f-5ddd5ba7e661.png"
                                alt="FinAI Logo"
                                className="w-10 h-10 object-contain"
                            />
                            <span className="text-xl font-bold bg-gradient-to-r from-primary to-primary-light bg-clip-text text-transparent">
                                FinAI
                            </span>
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            Empowering your financial future with intelligent, local-first ML insights.
                            Manage your wealth, securely and privately.
                        </p>
                    </div>

                    {/* Navigation Section */}
                    <div className="space-y-4">
                        <h4 className="text-sm font-semibold uppercase tracking-wider text-foreground">Navigation</h4>
                        <ul className="space-y-2">
                            <li>
                                <Link to="/dashboard" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                                    Dashboard
                                </Link>
                            </li>
                            <li>
                                <Link to="/budget" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                                    Budget Management
                                </Link>
                            </li>
                            <li>
                                <Link to="/transactions" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                                    Transactions
                                </Link>
                            </li>
                            <li>
                                <Link to="/savings" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                                    Savings Goals
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Resources & Support */}
                    <div className="space-y-4">
                        <h4 className="text-sm font-semibold uppercase tracking-wider text-foreground">Support</h4>
                        <ul className="space-y-2">
                            <li>
                                <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                                    Help Center
                                </a>
                            </li>
                            <li>
                                <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                                    Privacy Policy
                                </a>
                            </li>
                            <li>
                                <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                                    Terms of Service
                                </a>
                            </li>
                        </ul>
                    </div>

                </div>

                <div className="mt-12 pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0 text-xs text-muted-foreground italic">
                    <p>© 2025 FinAI HackOps. Built with passion for financial health. Powered by Team <span className="text-primary font-bold">HackOps</span>.</p>
                    <div className="flex space-x-4">
                        <span>v1.2.0-stable</span>
                        <span>Local Database Secured</span>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
