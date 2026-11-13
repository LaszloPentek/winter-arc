import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { loadCover } from "../services/cover";
export function useCover(user?: string) {
  return useQuery({queryKey:["cover",user], queryFn:()=>loadCover(user!), enabled:!!user,
    staleTime:20000, refetchInterval:30000, retry:1});
}
export function useBlobUrl(blob?: Blob | null) {
  const [value,setValue] = useState<{blob:Blob;url:string}|null>(null);
  useEffect(()=>{
    if (!blob) return;
    const url=URL.createObjectURL(blob);
    setValue({blob,url});
    return ()=>URL.revokeObjectURL(url);
  },[blob]);
  return value?.blob === blob ? value?.url : undefined;
}
