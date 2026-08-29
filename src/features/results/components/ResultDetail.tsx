"use client";

import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { formatScore, formatPercentage } from "@/utils/format";
import type { AttemptDetail } from "../types";

interface ResultDetailProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  detail: AttemptDetail | null;
  isLoading: boolean;
}

export function ResultDetail({
  open,
  onOpenChange,
  detail,
  isLoading,
}: Readonly<ResultDetailProps>) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>
            {detail
              ? `${detail.nama_peserta} - ${detail.topic_nama}`
              : "Perincian Keputusan"}
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-8 w-32" />
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        ) : detail ? (
          <div className="space-y-4">
            <div className="text-center">
              <p className="text-2xl font-bold">
                {formatScore(detail.skor, detail.jumlah_soalan)}
              </p>
              <p className="text-lg text-muted-foreground">
                {formatPercentage(detail.skor, detail.jumlah_soalan)}
              </p>
            </div>

            <ScrollArea className="max-h-[50vh]">
              <div className="space-y-3 pr-4">
                {detail.perincian.map((item, i) => (
                  <div key={item.question_id} className="rounded-lg border p-3">
                    <div className="flex items-start gap-2">
                      <div className="mt-0.5">
                        {item.adalah_betul ? (
                          <CheckCircle2 className="h-5 w-5 text-green-500" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-500" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">
                          Soalan {i + 1}: {item.teks_soalan}
                        </p>
                        <div className="mt-1 flex gap-2">
                          <Badge variant="outline" className="text-xs">
                            {item.jenis_soalan}
                          </Badge>
                          <Badge
                            variant={
                              item.adalah_betul ? "default" : "destructive"
                            }
                            className="text-xs"
                          >
                            {item.adalah_betul ? "Betul" : "Salah"}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        ) : (
          <p className="text-center text-muted-foreground">
            Tiada data perincian.
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
}
