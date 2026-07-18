import { Card, CardContent, CardHeader, CardTitle } from "../ui/Card";
import { DollarSign, Calculator, Download, PieChart } from "lucide-react";

const salaryData = [
  { name: "Abdullayev Jasur", base: 8000000, bonus: 1200000, tax: 1104000, net: 8096000 },
  { name: "Karimova Dilnoza", base: 7500000, bonus: 800000, tax: 996000, net: 7304000 },
  { name: "Rahimov Bobur", base: 12000000, bonus: 2500000, tax: 1740000, net: 12760000 },
  { name: "Toshmatov Sardor", base: 6500000, bonus: 500000, tax: 840000, net: 6160000 },
  { name: "Xolmatova Madina", base: 7000000, bonus: 1000000, tax: 960000, net: 7040000 },
];

const totalNet = salaryData.reduce((s, e) => s + e.net, 0);
const totalTax = salaryData.reduce((s, e) => s + e.tax, 0);

export const SalaryCalculation = () => {
  const formatCurrency = (val: number) => {
    return val.toLocaleString('uz-UZ') + " so'm";
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-emerald-500/10 rounded-2xl text-emerald-500">
                <DollarSign className="w-6 h-6" />
              </div>
              <div>
                <p className="text-base font-bold text-text-muted uppercase tracking-wider">Jami To'lov (Net)</p>
                <h3 className="text-2xl font-bold text-text-primary">{formatCurrency(totalNet)}</h3>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-rose-500/10 rounded-2xl text-rose-500">
                <PieChart className="w-6 h-6" />
              </div>
              <div>
                <p className="text-base font-bold text-text-muted uppercase tracking-wider">Jami Soliqlar</p>
                <h3 className="text-2xl font-bold text-text-primary">{formatCurrency(totalTax)}</h3>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-brand-500/10 rounded-2xl text-brand-500">
                <Calculator className="w-6 h-6" />
              </div>
              <div>
                <p className="text-base font-bold text-text-muted uppercase tracking-wider">O'rtacha Oylik</p>
                <h3 className="text-2xl font-bold text-text-primary">{formatCurrency(Math.round(totalNet / salaryData.length))}</h3>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Ish Haqi Hisob-kitobi (Mart 2024)</CardTitle>
          <button className="flex items-center gap-2 px-4 py-2 bg-surface-ground text-text-primary rounded-xl hover:bg-surface-dark transition-all font-bold text-base border border-border-dark">
            <Download className="w-5 h-5" /> PDF Yuklash
          </button>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-base">
            <thead className="bg-surface-card/50 text-text-muted border-b border-border-dark">
              <tr>
                <th className="px-6 py-4 font-medium">Xodim</th>
                <th className="px-6 py-4 font-medium text-right">Asosiy oylik</th>
                <th className="px-6 py-4 font-medium text-right">Bonus</th>
                <th className="px-6 py-4 font-medium text-right">Soliq (12%)</th>
                <th className="px-6 py-4 font-medium text-right">Qo'lga tegadigan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-dark">
              {salaryData.map((salary, i) => (
                <tr key={i} className="hover:bg-surface-card/50 transition-colors">
                  <td className="px-6 py-4 font-bold text-text-primary">{salary.name}</td>
                  <td className="px-6 py-4 text-right text-text-secondary">{formatCurrency(salary.base)}</td>
                  <td className="px-6 py-4 text-right text-emerald-400">+{formatCurrency(salary.bonus)}</td>
                  <td className="px-6 py-4 text-right text-rose-400">-{formatCurrency(salary.tax)}</td>
                  <td className="px-6 py-4 text-right font-bold text-brand-400">{formatCurrency(salary.net)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
