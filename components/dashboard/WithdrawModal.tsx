import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useState } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const COIN_OPTIONS = ["Bitcoin", "USDT", "XRP", "Solana", "Ethereum"];

export function WithdrawModal({
  open,
  onClose,
  onSubmit,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: { amount: number; wallet: string; coin: string }) => void;
}) {
  const [amount, setAmount] = useState("");
  const [wallet, setWallet] = useState("");
  const [coin, setCoin] = useState("");

  const handleSubmit = () => {
    if (amount && wallet && coin) {
      onSubmit({ amount: parseFloat(amount), wallet, coin });
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] max-w-[95vw] mx-2 rounded-[20px] border-royal  text-white">
        <DialogHeader>
          <DialogTitle className="text-gold">Withdraw Funds</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 p-2 sm:p-0">
          <Input
            type="number"
            placeholder="Enter amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="text-sm sm:text-base  border-royal text-white placeholder:text-white/70"
          />
          <Select value={coin} onValueChange={setCoin}>
            <SelectTrigger className="w-full text-sm sm:text-base  border-royal text-white">
              <SelectValue placeholder="Select Coin" className="text-white" />
            </SelectTrigger>
            <SelectContent className=" border-royal text-white">
              {COIN_OPTIONS.map((coinOption) => (
                <SelectItem key={coinOption} value={coinOption} className="text-sm sm:text-base hover:bg-royal text-white">
                  {coinOption}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            type="text"
            placeholder="Wallet address"
            value={wallet}
            onChange={(e) => setWallet(e.target.value)}
            className="text-sm sm:text-base  border-royal text-white placeholder:text-white/70"
          />
        </div>
        <DialogFooter className="px-2 sm:px-0">
          <Button 
            onClick={handleSubmit} 
            className="w-full sm:w-auto bg-gold hover:bg-gold-dark text-royal-dark font-bold"
          >
            Place Withdrawal
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
