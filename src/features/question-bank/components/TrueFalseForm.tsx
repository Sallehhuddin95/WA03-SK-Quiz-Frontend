"use client";

import { useFormContext } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

export function TrueFalseForm() {
  const { control } = useFormContext();

  return (
    <div className="space-y-4">
      <FormField
        control={control}
        name="jawapan_betul.nilai"
        render={({ field }) => (
          <FormItem>
            <FormLabel required>Jawapan Betul</FormLabel>
            <FormControl>
              <RadioGroup
                onValueChange={(val) => field.onChange(val === "true")}
                value={
                  field.value === true
                    ? "true"
                    : field.value === false
                      ? "false"
                      : undefined
                }
                className="flex gap-4"
              >
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="true" id="betul" />
                  <FormLabel htmlFor="betul" className="cursor-pointer font-normal">
                    Betul
                  </FormLabel>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="false" id="salah" />
                  <FormLabel htmlFor="salah" className="cursor-pointer font-normal">
                    Salah
                  </FormLabel>
                </div>
              </RadioGroup>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
