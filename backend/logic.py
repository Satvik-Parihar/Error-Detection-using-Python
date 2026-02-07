def calculate_vrc(data: str, even_parity: bool = True) -> dict:
    """
    Calculates Vertical Redundancy Check (VRC).
    """
    ones = data.count('1')
    if even_parity:
        parity_bit = '1' if ones % 2 != 0 else '0'
    else:
        parity_bit = '0' if ones % 2 != 0 else '1'
    
    return {
        "data": data,
        "parity_type": "Even" if even_parity else "Odd",
        "parity_bit": parity_bit,
        "result": data + parity_bit
    }

def calculate_lrc(data_blocks: list[str], even_parity: bool = True) -> dict:
    """
    Calculates Longitudinal Redundancy Check (LRC).
    Assumes all blocks are of equal length.
    """
    if not data_blocks:
        return {"error": "No data blocks provided"}
    
    length = len(data_blocks[0])
    lrc_bits = []
    
    for i in range(length):
        ones = sum(1 for block in data_blocks if block[i] == '1')
        if even_parity:
            lrc_bits.append('1' if ones % 2 != 0 else '0')
        else:
            lrc_bits.append('0' if ones % 2 != 0 else '1')
            
    lrc_str = "".join(lrc_bits)
    
    return {
        "data_blocks": data_blocks,
        "lrc": lrc_str,
        "result": data_blocks + [lrc_str]
    }

def verify_lrc(data_blocks: list[str], received_lrc: str, even_parity: bool = True) -> dict:
    calc_res = calculate_lrc(data_blocks, even_parity)
    calculated_lrc = calc_res["lrc"]
    is_valid = calculated_lrc == received_lrc
    
    return {
        "calculated_lrc": calculated_lrc,
        "received_lrc": received_lrc,
        "is_valid": is_valid
    }

def binary_division(dividend: str, divisor: str):
    n = len(divisor)
    # We iterate such that we process every bit of the original dividend (message)
    # as the MSB of the current window.
    # The 'dividend' passed here is usually padded.
    # Loop length: len(dividend) - n + 1
    
    tmp = dividend[0:n]
    quotient = []
    steps = []
    
    def xor(a, b):
        res = []
        for i in range(1, len(b)):
            res.append('0' if a[i] == b[i] else '1')
        return "".join(res)
    
    for i in range(len(dividend) - n + 1):
        if tmp[0] == '1':
            quotient.append('1')
            res = xor(divisor, tmp)
            current_divisor = divisor
        else:
            quotient.append('0')
            res = xor('0' * n, tmp)
            current_divisor = '0' * n
            
        steps.append({
            "current_dividend": tmp,
            "divisor": current_divisor,
            "quotient_bit": quotient[-1],
            "result_xor": res
        })
        
        if i + n < len(dividend):
            tmp = res + dividend[i + n]
        else:
            tmp = res
            
    return tmp, "".join(quotient), steps

def calculate_crc(data: str, divisor: str) -> dict:
    n = len(divisor)
    padded_data = data + '0' * (n - 1)
    
    remainder, quotient, steps = binary_division(padded_data, divisor)
    
    return {
        "data": data,
        "divisor": divisor,
        "remainder": remainder,
        "quotient": quotient,
        "codeword": data + remainder,
        "steps": steps
    }

def verify_crc(codeword: str, divisor: str) -> dict:
    remainder, quotient, steps = binary_division(codeword, divisor)
    is_valid = all(c == '0' for c in remainder)
    
    return {
        "codeword": codeword,
        "divisor": divisor,
        "remainder": remainder,
        "quotient": quotient,
        "is_valid": is_valid,
        "steps": steps
    }

def calculate_checksum(data: str, block_size: int = 8) -> dict:
    # Need to handle padding if data length not multiple of block_size
    if len(data) % block_size != 0:
        data = data.zfill((len(data) // block_size + 1) * block_size)
        
    blocks = [data[i:i+block_size] for i in range(0, len(data), block_size)]
    
    current_sum = 0
    steps = []
    
    for block in blocks:
        val = int(block, 2)
        steps.append(f"Add {block} ({val}) to sum {current_sum}")
        current_sum += val
        
    max_val = (1 << block_size) - 1
    
    steps.append(f"Total Sum (raw): {current_sum} ({bin(current_sum)[2:]})")
    
    while current_sum > max_val:
        carry = current_sum >> block_size
        current_sum = (current_sum & max_val) + carry
        steps.append(f"Wrapping carry: new sum = {current_sum} ({bin(current_sum)[2:].zfill(block_size)})")
        
    checksum_int = normalize_bits(~current_sum, block_size)
    checksum_bin = bin(checksum_int)[2:].zfill(block_size)
    
    return {
        "data": data,
        "blocks": blocks,
        "sum": bin(current_sum)[2:].zfill(block_size),
        "checksum": checksum_bin,
        "steps": steps
    }

def verify_checksum(data: str, block_size: int = 8) -> dict:
    # data includes checkusm
    res = calculate_checksum(data, block_size)
    # If valid, final checksum (of data+sent_checksum) should be 0 because Sum is all 1s
    is_valid = all(c == '0' for c in res["checksum"])
    
    return {
        "calculated_sum": res["sum"],
        "calculated_checksum": res["checksum"],
        "is_valid": is_valid,
        "steps": res["steps"]
    }

def normalize_bits(val, width):
    return val & ((1 << width) - 1)

def hamming_encode(data: str) -> dict:
    m = len(data)
    r = 0
    while (1 << r) < (m + r + 1):
        r += 1
        
    total_len = m + r
    codeword = ['0'] * (total_len + 1)
    
    data_idx = 0
    parity_indices = []
    
    for i in range(1, total_len + 1):
        if (i & (i - 1)) == 0:
            parity_indices.append(i)
        else:
            if data_idx < len(data):
                codeword[i] = data[data_idx]
                data_idx += 1
    
    steps = []
    for p in parity_indices:
        xor_val = 0
        covered_indices = []
        bit_values = []
        for i in range(1, total_len + 1):
            if (i & p) == p:
                if (i & (i - 1)) == 0:
                    bit_name = f"p{i}"
                else:
                    bit_name = f"d{i}"
                covered_indices.append(bit_name)
                val = codeword[i]
                if i == p:
                    bit_values.append(f"{bit_name}(?)")
                else:
                    bit_values.append(f"{bit_name}({val})")
                
                if val == '1':
                     xor_val ^= 1
        
        codeword[p] = str(xor_val)
        steps.append({
            "parity": f"p{p}",
            "covered": ", ".join(covered_indices),
            "bits_str": " + ".join(bit_values),
            "result": str(xor_val)
        })
        
    final_code = "".join(codeword[1:])
    return {
        "data": data,
        "redundancy_bits": r,
        "total_length": total_len,
        "codeword": final_code,
        "parity_positions": parity_indices,
        "steps": steps
    }

def verify_hamming(codeword: str) -> dict:
    n = len(codeword)
    # Calculate number of parity bits 'r' based on length n?
    # Actually, we just need to check all powers of 2 less than n.
    syndrome = 0
    steps = []
    
    parity_indices = []
    i = 1
    while i <= n:
        parity_indices.append(i)
        i *= 2
        
    for p in parity_indices:
        xor_val = 0
        for i in range(1, n + 1):
            if (i & p) == p:
                if codeword[i-1] == '1':
                    xor_val ^= 1
        
        if xor_val != 0:
            syndrome += p
            
        steps.append({
            "parity": f"p{p}",
            "check_val": xor_val 
        })
        
    status = "ACCEPTED"
    error_pos = None
    corrected_codeword = codeword
    
    if syndrome != 0:
        error_pos = syndrome
        if error_pos <= n:
            status = "ERROR CORRECTED"
            chars = list(codeword)
            # Flip bit at syndrome position (1-based index)
            chars[error_pos - 1] = '1' if chars[error_pos - 1] == '0' else '0'
            corrected_codeword = "".join(chars)
        else:
            status = "DETECTED (UNCORRECTABLE)"
            
    return {
        "codeword": codeword,
        "syndrome": syndrome,
        "error_position": error_pos,
        "corrected_codeword": corrected_codeword,
        "status": status,
        "steps": steps
    }
