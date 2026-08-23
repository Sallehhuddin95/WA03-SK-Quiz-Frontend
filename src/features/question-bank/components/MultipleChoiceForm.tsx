"use client";

import { useFormContext } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const CHOICE_LETTERS = ["A", "B", "C", "D"] as const;

export function MultipleChoiceForm() {
  const { control } = useFormContext();

  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm font-medium mb-3">Pilihan Jawapan</p>
        <div className="grid gap-3">
          {CHOICE_LETTERS.map((letter) => (
            <FormField
              key={letter}
              control={control}
              name={`pilihan.${letter}`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">
                      {letter}
                    </span>
                    Pilihan {letter}
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder={`Teks pilihan ${letter}`}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          ))}
        </div>
      </div>

      <FormField
        control={control}
        name="jawapan_betul.pilihan"
        render={({ field }) => (
          <FormItem>
            <FormLabel required>Jawapan Betul</FormLabel>
            <Select onValueChange={field.onChange} value={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih jawapan betul" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {CHOICE_LETTERS.map((letter) => (
                  <SelectItem key={letter} value={letter}>
                    {letter}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
