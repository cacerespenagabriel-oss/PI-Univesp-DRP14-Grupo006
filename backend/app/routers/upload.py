from fastapi import APIRouter, File, UploadFile, HTTPException, Depends
import pandas as pd
import io
from app.core.security import verificar_token

router = APIRouter(prefix="/upload", tags=["ETL Upload"])

COLUNAS_OBRIGATORIAS = {"data", "colaborador", "status"}

@router.post("/", dependencies=[Depends(verificar_token)])
async def upload_attendance_file(file: UploadFile = File(...)):
    if not file.filename.endswith(('.csv', '.xlsx', '.xls')):
        raise HTTPException(
            status_code=400, 
            detail="Formato inválido. Envie um arquivo CSV ou Excel."
        )
    
    try:
        contents = await file.read()
        
        if file.filename.endswith('.csv'):
            df = pd.read_csv(io.BytesIO(contents))
        else:
            df = pd.read_excel(io.BytesIO(contents))
        
        # 1. Normaliza os nomes das colunas para minúsculas
        df.columns = [col.strip().lower() for col in df.columns]
        
        # 2. Valida se as colunas essenciais existem no arquivo
        colunas_encontradas = set(df.columns)
        if not COLUNAS_OBRIGATORIAS.issubset(colunas_encontradas):
            faltantes = list(COLUNAS_OBRIGATORIAS - colunas_encontradas)
            raise HTTPException(
                status_code=422,
                detail=f"Estrutura do arquivo inválida. Colunas ausentes: {', '.join(faltantes)}"
            )
        
        # 3. Limpeza simples
        df = df.dropna(how="all")
        
        return {
            "filename": file.filename,
            "status": "sucesso",
            "total_registos_processados": len(df),
            "colunas_identificadas": list(df.columns),
            "amostra_dados": df.head(5).to_dict(orient="records")
        }
        
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao processar o arquivo: {str(e)}")